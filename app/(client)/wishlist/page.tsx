"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Heart, Loader2, ShoppingCart, Trash2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useCart } from "@/app/context/CartContext";

interface WishlistItem {
  id: number;
  product: {
    id: number;
    title: string;
    description: string | null;
    price: number;
    image: string | null;
    status: string;
    stock: number;
    category: {
      id: number;
      name: string;
    };
  };
  createdAt: string;
}

export default function WishlistPage() {
  const router = useRouter();
  const { status } = useSession();
  const { addItem } = useCart();
  const [loading, setLoading] = useState(true);
  const [wishlist, setWishlist] = useState<WishlistItem[]>([]);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
      return;
    }

    if (status === "authenticated") {
      fetchWishlist();
    }
  }, [status]);

  const fetchWishlist = async () => {
    try {
      const response = await fetch("/api/wishlist");
      if (response.ok) {
        const data = await response.json();
        setWishlist(data);
      }
    } catch (error) {
      console.error("Error fetching wishlist:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async (productId: number) => {
    try {
      const response = await fetch(`/api/wishlist?productId=${productId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setWishlist(wishlist.filter((item) => item.product.id !== productId));
      } else {
        alert("Erreur lors de la suppression");
      }
    } catch (error) {
      console.error("Error removing from wishlist:", error);
      alert("Erreur lors de la suppression");
    }
  };

  const handleAddToCart = (item: WishlistItem) => {
    addItem({
      productId: item.product.id,
      title: item.product.title,
      price: item.product.price,
      image: item.product.image || undefined,
    });
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-16 flex justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Ma liste de souhaits</h1>

      {wishlist.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center">
            <Heart className="w-16 h-16 mx-auto text-gray-300 mb-4" />
            <p className="text-lg font-medium mb-2">
              Votre wishlist est vide
            </p>
            <p className="text-sm text-muted-foreground mb-6">
              Ajoutez des produits à votre wishlist pour les retrouver facilement
            </p>
            <Button asChild>
              <Link href="/products">Découvrir nos produits</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {wishlist.map((item) => {
            const isOutOfStock = item.product.stock === 0;
            const isPublished = item.product.status === "published";
            const isAvailable = !isOutOfStock && isPublished;

            return (
              <Card key={item.id} className="overflow-hidden">
                <Link href={`/products/${item.product.id}`}>
                  <div className="relative aspect-square bg-gray-100">
                    {item.product.image ? (
                      <Image
                        src={item.product.image}
                        alt={item.product.title}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="flex items-center justify-center w-full h-full text-gray-400">
                        Aucune image
                      </div>
                    )}
                  </div>
                </Link>
                <CardHeader>
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <CardTitle className="text-lg line-clamp-2">
                        <Link
                          href={`/products/${item.product.id}`}
                          className="hover:underline"
                        >
                          {item.product.title}
                        </Link>
                      </CardTitle>
                      <CardDescription>{item.product.category.name}</CardDescription>
                    </div>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => handleRemove(item.product.id)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-2xl font-bold text-primary">
                        {(item.product.price / 100).toFixed(2)} €
                      </span>
                      {!isAvailable && (
                        <span className="text-sm text-red-500">
                          {isOutOfStock ? "Rupture" : "Indisponible"}
                        </span>
                      )}
                    </div>

                    <Button
                      className="w-full"
                      onClick={() => handleAddToCart(item)}
                      disabled={!isAvailable}
                    >
                      <ShoppingCart className="w-4 h-4 mr-2" />
                      {isAvailable ? "Ajouter au panier" : "Indisponible"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
