import { NextRequest, NextResponse } from "next/server";
import prisma from "@/app/api/prisma/client";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";

// GET /api/orders - Récupérer toutes les commandes de l'utilisateur
export async function GET() {
  try {
    const { getUser } = getKindeServerSession();
    const user = await getUser();

    if (!user || !user.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Trouver l'utilisateur dans la base de données
    const dbUser = await prisma.user.findUnique({
      where: { email: user.email },
    });

    if (!dbUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Récupérer les commandes de l'utilisateur
    const orders = await prisma.order.findMany({
      where: { userId: dbUser.id },
      include: {
        orderItems: {
          include: {
            product: true,
          },
        },
        shippingAddress: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(orders, { status: 200 });
  } catch (error) {
    console.error("Error fetching orders:", error);
    return NextResponse.json(
      { error: "Failed to fetch orders" },
      { status: 500 }
    );
  }
}

// POST /api/orders - Créer une nouvelle commande
export async function POST(request: NextRequest) {
  try {
    const { getUser } = getKindeServerSession();
    const user = await getUser();

    if (!user || !user.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { items, shippingAddress, paymentMethod } = body;

    // Validation
    if (!items || items.length === 0) {
      return NextResponse.json(
        { error: "Order must contain at least one item" },
        { status: 400 }
      );
    }

    if (!shippingAddress) {
      return NextResponse.json(
        { error: "Shipping address is required" },
        { status: 400 }
      );
    }

    // Trouver ou créer l'utilisateur dans la base de données
    let dbUser = await prisma.user.findUnique({
      where: { email: user.email },
    });

    if (!dbUser) {
      // Créer l'utilisateur s'il n'existe pas
      dbUser = await prisma.user.create({
        data: {
          email: user.email,
          firstName: user.given_name || "User",
          lastName: user.family_name || "",
          password: "", // Pas de mot de passe pour les utilisateurs Kinde
          birthDate: new Date(),
          role: "user",
        },
      });
    }

    // Créer l'adresse de livraison
    const address = await prisma.address.create({
      data: {
        street: shippingAddress.street,
        city: shippingAddress.city,
        state: shippingAddress.state || "",
        zipCode: shippingAddress.zipCode,
        country: shippingAddress.country || "France",
      },
    });

    // Calculer le total
    const total = items.reduce(
      (sum: number, item: any) => sum + item.price * item.quantity,
      0
    );

    // Créer la commande avec les articles
    const order = await prisma.order.create({
      data: {
        userId: dbUser.id,
        shippingAddressId: address.id,
        total,
        paymentMethod: paymentMethod || "card",
        status: "pending",
        orderItems: {
          create: items.map((item: any) => ({
            productId: item.productId,
            quantity: item.quantity,
            price: item.price,
          })),
        },
      },
      include: {
        orderItems: {
          include: {
            product: true,
          },
        },
        shippingAddress: true,
      },
    });

    return NextResponse.json(order, { status: 201 });
  } catch (error) {
    console.error("Error creating order:", error);
    return NextResponse.json(
      { error: "Failed to create order" },
      { status: 500 }
    );
  }
}
