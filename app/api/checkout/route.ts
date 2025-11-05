import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { stripe } from "@/lib/stripe";
import prisma from "@/app/api/prisma/client";

export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Trouver l'utilisateur dans la base de données
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: {
        cart: {
          include: {
            cartItems: {
              include: {
                product: true,
              },
            },
          },
        },
      },
    });

    if (!user || !user.cart || user.cart.cartItems.length === 0) {
      return NextResponse.json(
        { error: "Panier vide ou utilisateur non trouvé" },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { shippingAddressId } = body;

    if (!shippingAddressId) {
      return NextResponse.json(
        { error: "Adresse de livraison manquante" },
        { status: 400 }
      );
    }

    // Vérifier que l'adresse existe
    const address = await prisma.address.findUnique({
      where: { id: parseInt(shippingAddressId) },
    });

    if (!address) {
      return NextResponse.json(
        { error: "Adresse de livraison invalide" },
        { status: 400 }
      );
    }

    // Calculer le total
    const total = user.cart.cartItems.reduce((sum, item) => {
      return sum + item.product.price * item.quantity;
    }, 0);

    // Créer la commande en base de données avec le statut "unpaid"
    const order = await prisma.order.create({
      data: {
        userId: user.id,
        total,
        shippingAddressId: parseInt(shippingAddressId),
        paymentMethod: "card", // Stripe utilise principalement les cartes
        paymentStatus: "unpaid",
        status: "pending",
        orderItems: {
          create: user.cart.cartItems.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
            price: item.product.price,
          })),
        },
      },
      include: {
        orderItems: {
          include: {
            product: true,
          },
        },
      },
    });

    // Créer les line items pour Stripe
    const lineItems = order.orderItems.map((item) => ({
      price_data: {
        currency: "eur",
        product_data: {
          name: item.product.title,
          description: item.product.description || undefined,
          images: item.product.image ? [item.product.image] : undefined,
        },
        unit_amount: item.price, // Prix en centimes
      },
      quantity: item.quantity,
    }));

    // Créer une session de checkout Stripe
    const stripeSession = await stripe.checkout.sessions.create({
      payment_method_types: ["card", "paypal"],
      line_items: lineItems,
      mode: "payment",
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/cart`,
      customer_email: user.email,
      metadata: {
        orderId: order.id.toString(),
        userId: user.id,
      },
      payment_intent_data: {
        metadata: {
          orderId: order.id.toString(),
        },
      },
    });

    // Mettre à jour la commande avec l'ID de session Stripe
    await prisma.order.update({
      where: { id: order.id },
      data: {
        stripeSessionId: stripeSession.id,
      },
    });

    return NextResponse.json({
      sessionId: stripeSession.id,
      url: stripeSession.url,
      orderId: order.id,
    });
  } catch (error) {
    console.error("Stripe checkout error:", error);
    return NextResponse.json(
      {
        error: "Erreur lors de la création de la session de paiement",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
