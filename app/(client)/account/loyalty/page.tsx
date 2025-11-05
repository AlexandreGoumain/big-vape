"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Loader2, Trophy, Star, TrendingUp, Gift, Clock } from "lucide-react";

interface LoyaltyTransaction {
  id: number;
  points: number;
  type: string;
  description: string;
  createdAt: string;
}

interface LoyaltyTier {
  name: string;
  color: string;
  icon: string;
  benefits: string[];
}

interface LoyaltyStats {
  currentPoints: number;
  totalEarned: number;
  totalSpent: number;
  tier: LoyaltyTier;
}

interface Reward {
  id: number;
  title: string;
  description: string;
  pointsCost: number;
  type: string;
  value: number;
  stock: number | null;
  validDays: number;
}

interface UserReward {
  id: number;
  expiresAt: string;
  reward: Reward;
}

export default function LoyaltyPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [stats, setStats] = useState<LoyaltyStats | null>(null);
  const [transactions, setTransactions] = useState<LoyaltyTransaction[]>([]);
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [userRewards, setUserRewards] = useState<UserReward[]>([]);
  const [loading, setLoading] = useState(true);
  const [redeeming, setRedeeming] = useState<number | null>(null);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  useEffect(() => {
    if (status === "authenticated") {
      fetchLoyaltyData();
      fetchRewards();
    }
  }, [status]);

  const fetchLoyaltyData = async () => {
    try {
      const response = await fetch("/api/loyalty");
      if (response.ok) {
        const data = await response.json();
        setStats(data.stats);
        setTransactions(data.transactions);
      }
    } catch (error) {
      console.error("Error fetching loyalty data:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchRewards = async () => {
    try {
      const response = await fetch("/api/loyalty/rewards");
      if (response.ok) {
        const data = await response.json();
        setRewards(data.rewards);
        setUserRewards(data.userRewards);
      }
    } catch (error) {
      console.error("Error fetching rewards:", error);
    }
  };

  const handleRedeemReward = async (rewardId: number) => {
    setRedeeming(rewardId);

    try {
      const response = await fetch("/api/loyalty/rewards", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ rewardId }),
      });

      if (response.ok) {
        alert("Récompense obtenue avec succès !");
        fetchLoyaltyData();
        fetchRewards();
      } else {
        const data = await response.json();
        alert(data.error || "Erreur lors de l'échange");
      }
    } catch (error) {
      console.error("Error redeeming reward:", error);
      alert("Erreur lors de l'échange");
    } finally {
      setRedeeming(null);
    }
  };

  const getTierProgress = () => {
    if (!stats) return 0;
    const tiers = [
      { name: "Membre", min: 0, max: 500 },
      { name: "Bronze", min: 500, max: 2000 },
      { name: "Argent", min: 2000, max: 5000 },
      { name: "Or", min: 5000, max: 10000 },
      { name: "Platine", min: 10000, max: Infinity },
    ];

    const currentTier = tiers.find((t) => t.name === stats.tier.name);
    if (!currentTier || currentTier.max === Infinity) return 100;

    const progress =
      ((stats.totalEarned - currentTier.min) / (currentTier.max - currentTier.min)) * 100;
    return Math.min(progress, 100);
  };

  const getNextTierPoints = () => {
    if (!stats) return null;
    const tiers = [
      { name: "Bronze", points: 500 },
      { name: "Argent", points: 2000 },
      { name: "Or", points: 5000 },
      { name: "Platine", points: 10000 },
    ];

    const nextTier = tiers.find((t) => t.points > stats.totalEarned);
    return nextTier ? nextTier.points - stats.totalEarned : null;
  };

  const getRewardTypeLabel = (type: string) => {
    switch (type) {
      case "discount_percentage":
        return "Réduction %";
      case "discount_fixed":
        return "Réduction €";
      case "free_shipping":
        return "Livraison gratuite";
      case "free_product":
        return "Produit gratuit";
      default:
        return type;
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 flex justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="pt-6 text-center">
            <p>Impossible de charger les données de fidélité</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center gap-3 mb-6">
        <Trophy className="h-8 w-8 text-primary" />
        <h1 className="text-3xl font-bold">Programme de fidélité</h1>
      </div>

      {/* Statistiques principales */}
      <div className="grid md:grid-cols-3 gap-6 mb-8">
        {/* Points actuels */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Star className="h-5 w-5 text-yellow-500" />
              Mes points
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold text-primary">{stats.currentPoints}</p>
            <p className="text-sm text-muted-foreground mt-2">
              Points disponibles
            </p>
          </CardContent>
        </Card>

        {/* Total gagné */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-green-500" />
              Total gagné
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold">{stats.totalEarned}</p>
            <p className="text-sm text-muted-foreground mt-2">
              Depuis le début
            </p>
          </CardContent>
        </Card>

        {/* Niveau */}
        <Card className={stats.tier.color}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <span className="text-2xl">{stats.tier.icon}</span>
              Niveau {stats.tier.name}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Progress value={getTierProgress()} className="mb-2" />
            {getNextTierPoints() && (
              <p className="text-sm text-white/90">
                {getNextTierPoints()} points pour le niveau suivant
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Avantages du niveau */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Vos avantages</CardTitle>
          <CardDescription>
            Profitez de ces avantages exclusifs avec votre niveau {stats.tier.name}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            {stats.tier.benefits.map((benefit, index) => (
              <li key={index} className="flex items-center gap-2">
                <div className="w-2 h-2 bg-primary rounded-full" />
                {benefit}
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      {/* Mes récompenses actives */}
      {userRewards.length > 0 && (
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Gift className="h-5 w-5" />
              Mes récompenses actives
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {userRewards.map((userReward) => (
                <div
                  key={userReward.id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div>
                    <h3 className="font-semibold">{userReward.reward.title}</h3>
                    <p className="text-sm text-muted-foreground">
                      {userReward.reward.description}
                    </p>
                    <div className="flex items-center gap-2 mt-2 text-sm text-orange-600">
                      <Clock className="h-4 w-4" />
                      Expire le{" "}
                      {new Date(userReward.expiresAt).toLocaleDateString("fr-FR")}
                    </div>
                  </div>
                  <Badge>{getRewardTypeLabel(userReward.reward.type)}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Catalogue de récompenses */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Échanger mes points</CardTitle>
          <CardDescription>
            Utilisez vos points pour obtenir des récompenses exclusives
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4">
            {rewards.map((reward) => (
              <Card key={reward.id} className="border">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">{reward.title}</CardTitle>
                      <CardDescription className="mt-1">
                        {reward.description}
                      </CardDescription>
                    </div>
                    <Badge variant="outline">
                      {getRewardTypeLabel(reward.type)}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-2xl font-bold text-primary">
                        {reward.pointsCost}
                      </p>
                      <p className="text-sm text-muted-foreground">points</p>
                      {reward.stock !== null && (
                        <p className="text-xs text-orange-600 mt-1">
                          Stock: {reward.stock}
                        </p>
                      )}
                    </div>
                    <Button
                      onClick={() => handleRedeemReward(reward.id)}
                      disabled={
                        stats.currentPoints < reward.pointsCost ||
                        redeeming === reward.id ||
                        (reward.stock !== null && reward.stock <= 0)
                      }
                    >
                      {redeeming === reward.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : stats.currentPoints < reward.pointsCost ? (
                        "Points insuffisants"
                      ) : reward.stock !== null && reward.stock <= 0 ? (
                        "Rupture de stock"
                      ) : (
                        "Échanger"
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Historique des transactions */}
      <Card>
        <CardHeader>
          <CardTitle>Historique</CardTitle>
          <CardDescription>
            Vos dernières transactions de points de fidélité
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {transactions.map((transaction) => (
              <div
                key={transaction.id}
                className="flex items-center justify-between p-3 border rounded-lg"
              >
                <div className="flex-1">
                  <p className="font-medium">{transaction.description}</p>
                  <p className="text-sm text-muted-foreground">
                    {new Date(transaction.createdAt).toLocaleDateString("fr-FR", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
                <p
                  className={`text-lg font-bold ${
                    transaction.points > 0 ? "text-green-600" : "text-red-600"
                  }`}
                >
                  {transaction.points > 0 ? "+" : ""}
                  {transaction.points}
                </p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Comment gagner des points */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Comment gagner des points ?</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="p-4 bg-primary/5 rounded-lg">
              <p className="font-semibold mb-2">🛒 Achats</p>
              <p className="text-sm text-muted-foreground">
                10 points par euro dépensé
              </p>
            </div>
            <div className="p-4 bg-primary/5 rounded-lg">
              <p className="font-semibold mb-2">⭐ Avis</p>
              <p className="text-sm text-muted-foreground">
                50 points par avis produit
              </p>
            </div>
            <div className="p-4 bg-primary/5 rounded-lg">
              <p className="font-semibold mb-2">🎁 Bonus</p>
              <p className="text-sm text-muted-foreground">
                100 points à l'inscription
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
