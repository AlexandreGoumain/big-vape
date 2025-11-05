import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import prisma from "@/app/api/prisma/client";
import { sendOrderConfirmationEmail, sendAdminNewOrderEmail } from "@/lib/email";
import { awardOrderPoints } from "@/app/services/loyaltyService";
import Stripe from "stripe";

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json(
      { error: "No signature provided" },
      { status: 400 }
    );
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    console.error("Webhook signature verification failed:", err);
    return NextResponse.json(
      { error: `Webhook Error: ${err instanceof Error ? err.message : "Unknown error"}` },
      { status: 400 }
    );
  }

  // Gérer les différents types d'événements
  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      await handleCheckoutSessionCompleted(session);
      break;
    }

    case "payment_intent.succeeded": {
      const paymentIntent = event.data.object as Stripe.PaymentIntent;
      await handlePaymentIntentSucceeded(paymentIntent);
      break;
    }

    case "payment_intent.payment_failed": {
      const paymentIntent = event.data.object as Stripe.PaymentIntent;
      await handlePaymentIntentFailed(paymentIntent);
      break;
    }

    default:
      console.log(`Unhandled event type: ${event.type}`);
  }

  return NextResponse.json({ received: true });
}

async function handleCheckoutSessionCompleted(
  session: Stripe.Checkout.Session
) {
  try {
    const orderId = session.metadata?.orderId;

    if (!orderId) {
      console.error("No orderId in session metadata");
      return;
    }

    // Mettre à jour la commande
    const order = await prisma.order.update({
      where: { id: parseInt(orderId) },
      data: {
        paymentStatus: "paid",
        status: "processing",
        stripePaymentIntentId: session.payment_intent as string,
      },
      include: {
        user: true,
        orderItems: {
          include: {
            product: true,
          },
        },
        shippingAddress: true,
      },
    });

    // Vider le panier de l'utilisateur
    await prisma.cartItem.deleteMany({
      where: {
        cart: {
          userId: order.userId,
        },
      },
    });

    // Envoyer les emails de confirmation
    const customerName = order.user.firstName
      ? `${order.user.firstName}${order.user.lastName ? " " + order.user.lastName : ""}`
      : order.user.email.split("@")[0];

    // Email au client
    await sendOrderConfirmationEmail({
      orderId: order.id,
      customerName,
      customerEmail: order.user.email,
      orderItems: order.orderItems.map((item) => ({
        productName: item.product.title,
        quantity: item.quantity,
        price: item.price,
      })),
      totalAmount: order.total,
      shippingAddress: {
        street: order.shippingAddress.street,
        city: order.shippingAddress.city,
        zipCode: order.shippingAddress.zipCode,
        country: order.shippingAddress.country,
      },
    });

    // Email à l'admin
    await sendAdminNewOrderEmail({
      orderId: order.id,
      customerName,
      customerEmail: order.user.email,
      totalAmount: order.total,
      itemsCount: order.orderItems.length,
    });

    // Attribuer des points de fidélité
    try {
      const pointsEarned = await awardOrderPoints(
        order.userId,
        order.id,
        order.total
      );
      console.log(`Awarded ${pointsEarned} loyalty points for order ${orderId}`);
    } catch (error) {
      console.error("Error awarding loyalty points:", error);
    }

    console.log(`Order ${orderId} marked as paid and emails sent`);
  } catch (error) {
    console.error("Error handling checkout session completed:", error);
  }
}

async function handlePaymentIntentSucceeded(
  paymentIntent: Stripe.PaymentIntent
) {
  try {
    const orderId = paymentIntent.metadata?.orderId;

    if (!orderId) {
      console.error("No orderId in payment intent metadata");
      return;
    }

    await prisma.order.update({
      where: { id: parseInt(orderId) },
      data: {
        paymentStatus: "paid",
        stripePaymentIntentId: paymentIntent.id,
      },
    });

    console.log(`Payment succeeded for order ${orderId}`);
  } catch (error) {
    console.error("Error handling payment intent succeeded:", error);
  }
}

async function handlePaymentIntentFailed(
  paymentIntent: Stripe.PaymentIntent
) {
  try {
    const orderId = paymentIntent.metadata?.orderId;

    if (!orderId) {
      console.error("No orderId in payment intent metadata");
      return;
    }

    await prisma.order.update({
      where: { id: parseInt(orderId) },
      data: {
        paymentStatus: "failed",
        status: "cancelled",
      },
    });

    console.log(`Payment failed for order ${orderId}`);
  } catch (error) {
    console.error("Error handling payment intent failed:", error);
  }
}
