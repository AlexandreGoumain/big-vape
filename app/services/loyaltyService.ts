import { prisma } from "@/lib/prisma";

// Constantes pour les règles de points
export const LOYALTY_RULES = {
  POINTS_PER_EURO: 10, // 10 points par euro dépensé
  SIGNUP_BONUS: 100, // Bonus d'inscription
  REVIEW_BONUS: 50, // Bonus pour chaque avis
  MIN_ORDER_FOR_POINTS: 0, // Montant minimum de commande pour gagner des points
};

/**
 * Ajouter des points à un utilisateur
 */
export async function addLoyaltyPoints(
  userId: string,
  points: number,
  type: string,
  description: string,
  orderId?: number,
  rewardId?: number
) {
  try {
    // Créer la transaction
    await prisma.loyaltyTransaction.create({
      data: {
        userId,
        points,
        type,
        description,
        orderId,
        rewardId,
      },
    });

    // Mettre à jour les points de l'utilisateur
    await prisma.user.update({
      where: { id: userId },
      data: {
        loyaltyPoints: { increment: points },
        totalPointsEarned: points > 0 ? { increment: points } : undefined,
      },
    });

    return true;
  } catch (error) {
    console.error("Error adding loyalty points:", error);
    return false;
  }
}

/**
 * Déduire des points d'un utilisateur (rachat de récompense)
 */
export async function deductLoyaltyPoints(
  userId: string,
  points: number,
  rewardId: number,
  description: string
) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { loyaltyPoints: true },
    });

    if (!user || user.loyaltyPoints < points) {
      throw new Error("Points insuffisants");
    }

    // Créer la transaction (points négatifs)
    await prisma.loyaltyTransaction.create({
      data: {
        userId,
        points: -points,
        type: "redeemed",
        description,
        rewardId,
      },
    });

    // Déduire les points
    await prisma.user.update({
      where: { id: userId },
      data: {
        loyaltyPoints: { decrement: points },
      },
    });

    return true;
  } catch (error) {
    console.error("Error deducting loyalty points:", error);
    throw error;
  }
}

/**
 * Calculer les points gagnés pour une commande
 */
export function calculateOrderPoints(orderTotal: number): number {
  if (orderTotal < LOYALTY_RULES.MIN_ORDER_FOR_POINTS) {
    return 0;
  }

  // Convertir centimes en euros et multiplier par le taux
  const euros = orderTotal / 100;
  return Math.floor(euros * LOYALTY_RULES.POINTS_PER_EURO);
}

/**
 * Attribuer des points pour une commande
 */
export async function awardOrderPoints(userId: string, orderId: number, orderTotal: number) {
  const points = calculateOrderPoints(orderTotal);

  if (points > 0) {
    const euros = (orderTotal / 100).toFixed(2);
    await addLoyaltyPoints(
      userId,
      points,
      "earned_order",
      `${points} points gagnés pour votre commande de ${euros} €`,
      orderId
    );
  }

  return points;
}

/**
 * Attribuer des points pour un avis
 */
export async function awardReviewPoints(userId: string, productId: number) {
  await addLoyaltyPoints(
    userId,
    LOYALTY_RULES.REVIEW_BONUS,
    "earned_review",
    `${LOYALTY_RULES.REVIEW_BONUS} points gagnés pour votre avis`
  );

  return LOYALTY_RULES.REVIEW_BONUS;
}

/**
 * Attribuer le bonus d'inscription
 */
export async function awardSignupBonus(userId: string) {
  await addLoyaltyPoints(
    userId,
    LOYALTY_RULES.SIGNUP_BONUS,
    "earned_signup",
    `Bonus de bienvenue : ${LOYALTY_RULES.SIGNUP_BONUS} points`
  );

  return LOYALTY_RULES.SIGNUP_BONUS;
}

/**
 * Récupérer l'historique des points d'un utilisateur
 */
export async function getUserLoyaltyHistory(userId: string, limit: number = 50) {
  return await prisma.loyaltyTransaction.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: limit,
  });
}

/**
 * Obtenir le niveau de fidélité d'un utilisateur
 */
export function getLoyaltyTier(totalPoints: number): {
  name: string;
  color: string;
  icon: string;
  benefits: string[];
} {
  if (totalPoints >= 10000) {
    return {
      name: "Platine",
      color: "bg-slate-400",
      icon: "👑",
      benefits: [
        "20% de réduction sur toutes les commandes",
        "Livraison gratuite",
        "Accès anticipé aux nouveautés",
        "Support prioritaire",
      ],
    };
  } else if (totalPoints >= 5000) {
    return {
      name: "Or",
      color: "bg-yellow-500",
      icon: "⭐",
      benefits: [
        "15% de réduction sur toutes les commandes",
        "Livraison gratuite",
        "Accès anticipé aux nouveautés",
      ],
    };
  } else if (totalPoints >= 2000) {
    return {
      name: "Argent",
      color: "bg-gray-400",
      icon: "🥈",
      benefits: ["10% de réduction sur toutes les commandes", "Livraison gratuite"],
    };
  } else if (totalPoints >= 500) {
    return {
      name: "Bronze",
      color: "bg-orange-600",
      icon: "🥉",
      benefits: ["5% de réduction sur toutes les commandes"],
    };
  } else {
    return {
      name: "Membre",
      color: "bg-gray-600",
      icon: "🎯",
      benefits: ["Accumulez des points à chaque achat"],
    };
  }
}
