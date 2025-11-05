"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Star, Loader2 } from "lucide-react";
import Link from "next/link";

interface Review {
  id: number;
  rating: number;
  comment: string | null;
  createdAt: string;
  user: {
    id: string;
    firstName: string | null;
    lastName: string | null;
    email: string;
  };
}

interface ReviewStats {
  totalReviews: number;
  averageRating: number;
  ratingDistribution: { rating: number; count: number }[];
}

export default function ProductReviews({ productId }: { productId: number }) {
  const { data: session, status } = useSession();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [stats, setStats] = useState<ReviewStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [hoverRating, setHoverRating] = useState(0);

  useEffect(() => {
    fetchReviews();
  }, [productId]);

  const fetchReviews = async () => {
    try {
      const response = await fetch(`/api/products/${productId}/reviews`);
      if (response.ok) {
        const data = await response.json();
        setReviews(data.reviews);
        setStats(data.stats);
      }
    } catch (error) {
      console.error("Error fetching reviews:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (rating === 0) {
      alert("Veuillez sélectionner une note");
      return;
    }

    setSubmitting(true);

    try {
      const response = await fetch(`/api/products/${productId}/reviews`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ rating, comment }),
      });

      if (response.ok) {
        await fetchReviews();
        setShowForm(false);
        setRating(0);
        setComment("");
      } else {
        const error = await response.json();
        alert(error.error || "Erreur lors de l'envoi de l'avis");
      }
    } catch (error) {
      console.error("Error submitting review:", error);
      alert("Erreur lors de l'envoi de l'avis");
    } finally {
      setSubmitting(false);
    }
  };

  const StarRating = ({ value, interactive = false }: { value: number; interactive?: boolean }) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type={interactive ? "button" : undefined}
            disabled={!interactive}
            onClick={() => interactive && setRating(star)}
            onMouseEnter={() => interactive && setHoverRating(star)}
            onMouseLeave={() => interactive && setHoverRating(0)}
            className={interactive ? "cursor-pointer" : "cursor-default"}
          >
            <Star
              className={`w-5 h-5 ${
                star <= (interactive ? (hoverRating || rating) : value)
                  ? "fill-yellow-400 text-yellow-400"
                  : "text-gray-300"
              }`}
            />
          </button>
        ))}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Statistiques */}
      {stats && stats.totalReviews > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Avis clients</CardTitle>
            <CardDescription>
              {stats.totalReviews} avis • Note moyenne : {stats.averageRating}/5
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-8">
              <div className="text-center">
                <div className="text-4xl font-bold">{stats.averageRating}</div>
                <StarRating value={Math.round(stats.averageRating)} />
                <div className="text-sm text-muted-foreground mt-1">
                  {stats.totalReviews} avis
                </div>
              </div>

              <div className="flex-1 space-y-2">
                {stats.ratingDistribution.reverse().map((item) => (
                  <div key={item.rating} className="flex items-center gap-2">
                    <span className="text-sm w-8">{item.rating}★</span>
                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-yellow-400 h-2 rounded-full"
                        style={{
                          width: `${(item.count / stats.totalReviews) * 100}%`,
                        }}
                      />
                    </div>
                    <span className="text-sm text-muted-foreground w-8">
                      {item.count}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Formulaire d'avis */}
      {status === "authenticated" && !showForm && (
        <Button onClick={() => setShowForm(true)}>Laisser un avis</Button>
      )}

      {status === "unauthenticated" && (
        <Card>
          <CardContent className="py-6">
            <p className="text-center text-muted-foreground">
              <Link href="/login" className="text-primary hover:underline">
                Connectez-vous
              </Link>{" "}
              pour laisser un avis
            </p>
          </CardContent>
        </Card>
      )}

      {showForm && (
        <Card>
          <form onSubmit={handleSubmit}>
            <CardHeader>
              <CardTitle>Votre avis</CardTitle>
              <CardDescription>
                Partagez votre expérience avec ce produit
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">
                  Note <span className="text-red-500">*</span>
                </label>
                <StarRating value={rating} interactive={true} />
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">
                  Commentaire (optionnel)
                </label>
                <Textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Partagez votre avis sur ce produit..."
                  rows={4}
                />
              </div>
            </CardContent>
            <CardFooter className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setShowForm(false);
                  setRating(0);
                  setComment("");
                }}
              >
                Annuler
              </Button>
              <Button type="submit" disabled={submitting || rating === 0}>
                {submitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Envoi...
                  </>
                ) : (
                  "Publier l'avis"
                )}
              </Button>
            </CardFooter>
          </form>
        </Card>
      )}

      {/* Liste des avis */}
      <div className="space-y-4">
        {reviews.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center">
              <p className="text-muted-foreground">
                Aucun avis pour le moment. Soyez le premier à donner votre avis !
              </p>
            </CardContent>
          </Card>
        ) : (
          reviews.map((review) => {
            const userName = review.user.firstName
              ? `${review.user.firstName}${review.user.lastName ? " " + review.user.lastName[0] + "." : ""}`
              : review.user.email.split("@")[0];

            return (
              <Card key={review.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-base">{userName}</CardTitle>
                      <StarRating value={review.rating} />
                    </div>
                    <span className="text-sm text-muted-foreground">
                      {new Date(review.createdAt).toLocaleDateString("fr-FR")}
                    </span>
                  </div>
                </CardHeader>
                {review.comment && (
                  <CardContent>
                    <p className="text-sm">{review.comment}</p>
                  </CardContent>
                )}
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}
