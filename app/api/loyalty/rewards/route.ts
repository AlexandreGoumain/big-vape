import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { deductLoyaltyPoints } from "@/app/services/loyaltyService";

// Récupérer toutes les récompenses disponibles
export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    // Récupérer toutes les récompenses actives
    const rewards = await prisma.loyaltyReward.findMany({
      where: { isActive: true },
      orderBy: { pointsCost: "asc" },
    });

    // Si l'utilisateur est connecté, récupérer ses récompenses obtenues
    let userRewards = [];
    if (session?.user?.id) {
      userRewards = await prisma.userReward.findMany({
        where: {
          userId: session.user.id,
          isUsed: false,
          expiresAt: { gte: new Date() }, // Non expirées
        },
        include: {
          reward: true,
        },
      });
    }

    return NextResponse.json({
      rewards,
      userRewards,
    });
  } catch (error) {
    console.error("Error fetching rewards:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération des récompenses" },
      { status: 500 }
    );
  }
}

// Échanger des points contre une récompense
export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Non authentifié" },
        { status: 401 }
      );
    }

    const { rewardId } = await request.json();

    if (!rewardId) {
      return NextResponse.json(
        { error: "ID de récompense requis" },
        { status: 400 }
      );
    }

    // Récupérer la récompense
    const reward = await prisma.loyaltyReward.findUnique({
      where: { id: rewardId },
    });

    if (!reward || !reward.isActive) {
      return NextResponse.json(
        { error: "Récompense non disponible" },
        { status: 404 }
      );
    }

    // Vérifier le stock
    if (reward.stock !== null && reward.stock <= 0) {
      return NextResponse.json(
        { error: "Récompense en rupture de stock" },
        { status: 400 }
      );
    }

    // Récupérer l'utilisateur
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { loyaltyPoints: true },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Utilisateur non trouvé" },
        { status: 404 }
      );
    }

    // Vérifier si l'utilisateur a assez de points
    if (user.loyaltyPoints < reward.pointsCost) {
      return NextResponse.json(
        { error: "Points insuffisants" },
        { status: 400 }
      );
    }

    // Calculer la date d'expiration
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + reward.validDays);

    // Transaction pour déduire les points et créer la récompense utilisateur
    const [userReward] = await prisma.$transaction([
      // Créer la récompense pour l'utilisateur
      prisma.userReward.create({
        data: {
          userId: session.user.id,
          rewardId: reward.id,
          expiresAt,
        },
        include: {
          reward: true,
        },
      }),

      // Décrémenter le stock si limité
      ...(reward.stock !== null
        ? [
            prisma.loyaltyReward.update({
              where: { id: reward.id },
              data: { stock: { decrement: 1 } },
            }),
          ]
        : []),
    ]);

    // Déduire les points
    await deductLoyaltyPoints(
      session.user.id,
      reward.pointsCost,
      reward.id,
      `Échange de ${reward.pointsCost} points contre "${reward.title}"`
    );

    return NextResponse.json({
      message: "Récompense obtenue avec succès",
      userReward,
    });
  } catch (error) {
    console.error("Error redeeming reward:", error);
    return NextResponse.json(
      { error: "Erreur lors de l'échange de la récompense" },
      { status: 500 }
    );
  }
}
