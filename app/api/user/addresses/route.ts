import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import prisma from "@/app/api/prisma/client";

// GET - Récupérer toutes les adresses de l'utilisateur
export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const userAddresses = await prisma.userAddress.findMany({
      where: { userId: user.id },
      include: {
        address: true,
      },
      orderBy: [
        { isDefault: "desc" }, // Les adresses par défaut en premier
        { createdAt: "desc" },
      ],
    });

    return NextResponse.json(userAddresses);
  } catch (error) {
    console.error("Error fetching addresses:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération des adresses" },
      { status: 500 }
    );
  }
}

// POST - Créer une nouvelle adresse
export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const body = await request.json();
    const { street, city, state, zipCode, country, label, isDefault } = body;

    // Validation
    if (!street || !city || !zipCode || !country) {
      return NextResponse.json(
        { error: "Tous les champs d'adresse sont requis" },
        { status: 400 }
      );
    }

    // Si c'est la nouvelle adresse par défaut, retirer le flag des autres
    if (isDefault) {
      await prisma.userAddress.updateMany({
        where: { userId: user.id },
        data: { isDefault: false },
      });
    }

    // Créer l'adresse
    const address = await prisma.address.create({
      data: {
        street,
        city,
        state: state || "",
        zipCode,
        country,
      },
    });

    // Créer la liaison UserAddress
    const userAddress = await prisma.userAddress.create({
      data: {
        userId: user.id,
        addressId: address.id,
        label: label || null,
        isDefault: isDefault || false,
      },
      include: {
        address: true,
      },
    });

    return NextResponse.json(userAddress, { status: 201 });
  } catch (error) {
    console.error("Error creating address:", error);
    return NextResponse.json(
      { error: "Erreur lors de la création de l'adresse" },
      { status: 500 }
    );
  }
}
