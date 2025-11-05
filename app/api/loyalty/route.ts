import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { getUserLoyaltyHistory, getLoyaltyTier } from "@/app/services/loyaltyService";

// Récupérer les informations de fidélité de l'utilisateur
export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Non authentifié" },
        { status: 401 }
      );
    }

    // Récupérer l'utilisateur avec ses points
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        loyaltyPoints: true,
        totalPointsEarned: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Utilisateur non trouvé" },
        { status: 404 }
      );
    }

    // Récupérer l'historique des transactions
    const transactions = await getUserLoyaltyHistory(session.user.id, 20);

    // Obtenir le niveau de fidélité
    const tier = getLoyaltyTier(user.totalPointsEarned);

    // Calculer les statistiques
    const stats = {
      currentPoints: user.loyaltyPoints,
      totalEarned: user.totalPointsEarned,
      totalSpent: user.totalPointsEarned - user.loyaltyPoints,
      tier,
    };

    return NextResponse.json({
      stats,
      transactions,
    });
  } catch (error) {
    console.error("Error fetching loyalty info:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération des informations de fidélité" },
      { status: 500 }
    );
  }
}
