"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useCart } from "@/app/context/CartContext";
import { ShoppingCart, Check, Minus, Plus } from "lucide-react";
import Image from "next/image";
import { useState, useEffect } from "react";
import ProductReviews from "@/app/components/product/ProductReviews";
import WishlistButton from "@/app/components/product/WishlistButton";
import RecommendedProducts from "@/app/components/product/RecommendedProducts";

interface Product {
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
}

export default function ProductDetailClient({ product }: { product: Product }) {
  const { addItem, items } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [addedToCart, setAddedToCart] = useState(false);

  const isInCart = items.some((item) => item.productId === product.id);

  // Enregistrer la vue du produit
  useEffect(() => {
    const recordView = async () => {
      try {
        await fetch(`/api/products/${product.id}/view`, {
          method: "POST",
        });
      } catch (error) {
        console.error("Error recording view:", error);
      }
    };

    recordView();
  }, [product.id]);

  const handleAddToCart = () => {
    for (let i = 0; i < quantity; i++) {
      addItem({
        productId: product.id,
        title: product.title,
        price: product.price,
        image: product.image || undefined,
      });
    }

    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 2000);
  };

  const increaseQuantity = () => {
    if (quantity < product.stock) {
      setQuantity(quantity + 1);
    }
  };

  const decreaseQuantity = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1);
    }
  };

  const isOutOfStock = product.stock === 0;
  const isPublished = product.status === "published";

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid md:grid-cols-2 gap-8">
        {/* Image du produit */}
        <div className="relative aspect-square overflow-hidden rounded-lg bg-gray-100">
          {product.image ? (
            <Image
              src={product.image}
              alt={product.title}
              fill
              className="object-cover"
              priority
            />
          ) : (
            <div className="flex items-center justify-center w-full h-full text-gray-400">
              Aucune image
            </div>
          )}
        </div>

        {/* Détails du produit */}
        <div className="flex flex-col gap-6">
          <div>
            <Badge variant="outline" className="mb-2">
              {product.category.name}
            </Badge>
            <div className="flex items-start justify-between gap-4">
              <h1 className="text-3xl font-bold flex-1">{product.title}</h1>
              <WishlistButton
                productId={product.id}
                variant="default"
                size="default"
              />
            </div>
          </div>

          <div className="text-3xl font-bold text-primary">
            {(product.price / 100).toFixed(2)} €
          </div>

          {product.description && (
            <div>
              <h2 className="text-lg font-semibold mb-2">Description</h2>
              <p className="text-gray-600">{product.description}</p>
            </div>
          )}

          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col gap-4">
                {/* Statut */}
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Statut:</span>
                  <Badge variant={isPublished ? "default" : "secondary"}>
                    {isPublished ? "Disponible" : "Non disponible"}
                  </Badge>
                </div>

                {/* Stock */}
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Stock:</span>
                  <span
                    className={`text-sm ${
                      isOutOfStock ? "text-red-500" : "text-green-600"
                    }`}
                  >
                    {isOutOfStock
                      ? "Rupture de stock"
                      : `${product.stock} disponibles`}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Sélecteur de quantité */}
          {!isOutOfStock && isPublished && (
            <div className="flex items-center gap-4">
              <span className="text-sm font-medium">Quantité:</span>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={decreaseQuantity}
                  disabled={quantity <= 1}
                >
                  <Minus className="h-4 w-4" />
                </Button>
                <span className="w-12 text-center font-semibold">
                  {quantity}
                </span>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={increaseQuantity}
                  disabled={quantity >= product.stock}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}

          {/* Bouton Ajouter au panier */}
          <Button
            size="lg"
            onClick={handleAddToCart}
            disabled={isOutOfStock || !isPublished || addedToCart}
            className="w-full"
          >
            {addedToCart ? (
              <>
                <Check className="mr-2 h-5 w-5" />
                Ajouté au panier
              </>
            ) : (
              <>
                <ShoppingCart className="mr-2 h-5 w-5" />
                {isOutOfStock
                  ? "Rupture de stock"
                  : !isPublished
                  ? "Non disponible"
                  : isInCart
                  ? "Ajouter plus au panier"
                  : "Ajouter au panier"}
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Avis clients */}
      <div className="mt-12">
        <ProductReviews productId={product.id} />
      </div>

      {/* Produits recommandés */}
      <RecommendedProducts productId={product.id} />
    </div>
  );
}
