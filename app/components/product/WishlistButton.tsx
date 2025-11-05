"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

interface WishlistButtonProps {
  productId: number;
  variant?: "default" | "icon";
  size?: "default" | "sm" | "lg" | "icon";
  className?: string;
}

export default function WishlistButton({
  productId,
  variant = "icon",
  size = "icon",
  className = "",
}: WishlistButtonProps) {
  const router = useRouter();
  const { status } = useSession();
  const [isInWishlist, setIsInWishlist] = useState(false);
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    if (status === "authenticated") {
      checkWishlistStatus();
    } else {
      setChecking(false);
    }
  }, [status, productId]);

  const checkWishlistStatus = async () => {
    try {
      const response = await fetch("/api/wishlist");
      if (response.ok) {
        const wishlist = await response.json();
        const inWishlist = wishlist.some(
          (item: any) => item.product.id === productId
        );
        setIsInWishlist(inWishlist);
      }
    } catch (error) {
      console.error("Error checking wishlist status:", error);
    } finally {
      setChecking(false);
    }
  };

  const handleToggleWishlist = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (status !== "authenticated") {
      router.push("/login");
      return;
    }

    setLoading(true);

    try {
      if (isInWishlist) {
        // Remove from wishlist
        const response = await fetch(
          `/api/wishlist?productId=${productId}`,
          {
            method: "DELETE",
          }
        );

        if (response.ok) {
          setIsInWishlist(false);
        } else {
          const data = await response.json();
          alert(data.error || "Erreur lors de la suppression");
        }
      } else {
        // Add to wishlist
        const response = await fetch("/api/wishlist", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ productId }),
        });

        if (response.ok) {
          setIsInWishlist(true);
        } else {
          const data = await response.json();
          alert(data.error || "Erreur lors de l'ajout");
        }
      }
    } catch (error) {
      console.error("Error toggling wishlist:", error);
      alert("Une erreur est survenue");
    } finally {
      setLoading(false);
    }
  };

  if (checking) {
    return (
      <Button
        variant={variant === "icon" ? "ghost" : variant}
        size={size}
        disabled
        className={className}
      >
        <Heart className="w-4 h-4" />
      </Button>
    );
  }

  return (
    <Button
      variant={variant === "icon" ? "ghost" : variant}
      size={size}
      onClick={handleToggleWishlist}
      disabled={loading}
      className={`${className} ${
        isInWishlist ? "text-red-500 hover:text-red-700" : ""
      }`}
      title={isInWishlist ? "Retirer de la wishlist" : "Ajouter à la wishlist"}
    >
      <Heart
        className={`w-4 h-4 ${isInWishlist ? "fill-current" : ""}`}
      />
      {variant === "default" && (
        <span className="ml-2">
          {isInWishlist ? "Dans la wishlist" : "Ajouter à la wishlist"}
        </span>
      )}
    </Button>
  );
}
