import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

// Créer une nouvelle récompense (Admin uniquement)
export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.role || session.user.role !== "admin") {
      return NextResponse.json(
        { error: "Accès non autorisé" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { title, description, pointsCost, type, value, stock, validDays } = body;

    // Validation
    if (!title || !description || !pointsCost || !type || value === undefined) {
      return NextResponse.json(
        { error: "Tous les champs sont requis" },
        { status: 400 }
      );
    }

    const reward = await prisma.loyaltyReward.create({
      data: {
        title,
        description,
        pointsCost,
        type,
        value,
        stock: stock || null,
        validDays: validDays || 30,
      },
    });

    return NextResponse.json(reward, { status: 201 });
  } catch (error) {
    console.error("Error creating reward:", error);
    return NextResponse.json(
      { error: "Erreur lors de la création de la récompense" },
      { status: 500 }
    );
  }
}

// Récupérer toutes les récompenses (Admin uniquement)
export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.role || session.user.role !== "admin") {
      return NextResponse.json(
        { error: "Accès non autorisé" },
        { status: 403 }
      );
    }

    const rewards = await prisma.loyaltyReward.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        _count: {
          select: {
            userRewards: true,
          },
        },
      },
    });

    return NextResponse.json(rewards);
  } catch (error) {
    console.error("Error fetching rewards:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération des récompenses" },
      { status: 500 }
    );
  }
}
