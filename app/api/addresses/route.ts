import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import prisma from "@/app/api/prisma/client";

export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { street, city, zipCode, country, state } = body;

    // Validation
    if (!street || !city || !zipCode || !country) {
      return NextResponse.json(
        { error: "Tous les champs d'adresse sont requis" },
        { status: 400 }
      );
    }

    // Créer l'adresse
    const address = await prisma.address.create({
      data: {
        street,
        city,
        zipCode,
        country,
        state: state || "",
      },
    });

    return NextResponse.json(address, { status: 201 });
  } catch (error) {
    console.error("Error creating address:", error);
    return NextResponse.json(
      { error: "Erreur lors de la création de l'adresse" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Trouver l'utilisateur
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: {
        address: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json(user.address || null);
  } catch (error) {
    console.error("Error fetching address:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération de l'adresse" },
      { status: 500 }
    );
  }
}
