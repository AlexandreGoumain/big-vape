"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useCart } from "@/app/context/CartContext";
import { ShoppingCart, Check, Minus, Plus, Package, Truck, Shield } from "lucide-react";
import { useState, useEffect } from "react";
import VariantSelector, { ProductVariant } from "@/app/components/product/VariantSelector";
import VariantImageGallery from "@/app/components/product/VariantImageGallery";

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
  variants?: ProductVariant[];
}

export default function ProductDetailClient({ product }: { product: Product }) {
  const { addItem, items } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [addedToCart, setAddedToCart] = useState(false);
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);

  const hasVariants = product.variants && product.variants.length > 0;

  // Calculer les images disponibles
  const availableImages = hasVariants && selectedVariant?.image
    ? [selectedVariant.image]
    : product.image
    ? [product.image]
    : [];

  // Calculer le stock disponible
  const availableStock = hasVariants && selectedVariant
    ? selectedVariant.stock
    : product.stock;

  // Calculer le prix final
  const finalPrice = hasVariants && selectedVariant
    ? product.price + (selectedVariant.priceAdjustment || 0)
    : product.price;

  const isInCart = items.some((item) => item.productId === product.id);

  const handleVariantChange = (variant: ProductVariant | null) => {
    setSelectedVariant(variant);
    // Réinitialiser la quantité si la nouvelle variante a moins de stock
    if (variant && quantity > variant.stock) {
      setQuantity(Math.min(quantity, variant.stock));
    }
  };

  const handleAddToCart = () => {
    // Si le produit a des variantes, une variante doit être sélectionnée
    if (hasVariants && !selectedVariant) {
      return;
    }

    for (let i = 0; i < quantity; i++) {
      addItem({
        productId: product.id,
        title: product.title,
        price: finalPrice,
        image: (hasVariants && selectedVariant?.image) ? selectedVariant.image : product.image || undefined,
        variantId: selectedVariant?.id,
        variantName: selectedVariant?.name,
      });
    }

    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 2000);
  };

  const increaseQuantity = () => {
    if (quantity < availableStock) {
      setQuantity(quantity + 1);
    }
  };

  const decreaseQuantity = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1);
    }
  };

  const isOutOfStock = availableStock === 0;
  const isPublished = product.status === "published";
  const canAddToCart = !isOutOfStock && isPublished && (!hasVariants || selectedVariant);

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Breadcrumb */}
      <div className="mb-6 text-sm text-muted-foreground">
        <span>Accueil</span>
        <span className="mx-2">/</span>
        <span>{product.category.name}</span>
        <span className="mx-2">/</span>
        <span className="text-foreground font-medium">{product.title}</span>
      </div>

      <div className="grid lg:grid-cols-2 gap-12">
        {/* Galerie d'images */}
        <div className="animate-slide-up">
          <VariantImageGallery
            images={availableImages}
            productName={product.title}
          />
        </div>

        {/* Détails du produit */}
        <div className="flex flex-col gap-6 animate-slide-up">
          {/* En-tête */}
          <div className="space-y-3">
            <Badge variant="outline" className="text-xs uppercase tracking-wider">
              {product.category.name}
            </Badge>
            <h1 className="text-4xl lg:text-5xl font-bold leading-tight">
              {product.title}
            </h1>
            {!hasVariants && (
              <div className="text-4xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 bg-clip-text text-transparent">
                {(product.price / 100).toFixed(2)}€
              </div>
            )}
          </div>

          <Separator />

          {/* Description */}
          {product.description && (
            <div className="prose prose-sm max-w-none">
              <p className="text-muted-foreground leading-relaxed">
                {product.description}
              </p>
            </div>
          )}

          {/* Sélecteur de variantes */}
          {hasVariants && product.variants && (
            <>
              <Separator />
              <VariantSelector
                variants={product.variants}
                basePrice={product.price}
                onVariantChange={handleVariantChange}
              />
            </>
          )}

          <Separator />

          {/* Sélecteur de quantité */}
          {canAddToCart && (
            <div className="space-y-3">
              <label className="text-sm font-semibold uppercase tracking-wider">
                Quantité
              </label>
              <div className="flex items-center gap-3">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={decreaseQuantity}
                  disabled={quantity <= 1}
                  className="h-12 w-12 rounded-xl"
                >
                  <Minus className="h-5 w-5" />
                </Button>
                <div className="flex-1 text-center">
                  <span className="text-2xl font-bold">{quantity}</span>
                </div>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={increaseQuantity}
                  disabled={quantity >= availableStock}
                  className="h-12 w-12 rounded-xl"
                >
                  <Plus className="h-5 w-5" />
                </Button>
              </div>
            </div>
          )}

          {/* Bouton Ajouter au panier */}
          <Button
            size="lg"
            onClick={handleAddToCart}
            disabled={!canAddToCart || addedToCart}
            className="w-full h-14 text-lg font-semibold rounded-xl hover:scale-105 active:scale-95 transition-all duration-200"
          >
            {addedToCart ? (
              <>
                <Check className="mr-2 h-6 w-6" />
                Ajouté au panier !
              </>
            ) : (
              <>
                <ShoppingCart className="mr-2 h-6 w-6" />
                {isOutOfStock
                  ? "Rupture de stock"
                  : !isPublished
                  ? "Non disponible"
                  : hasVariants && !selectedVariant
                  ? "Sélectionnez une variante"
                  : "Ajouter au panier"}
              </>
            )}
          </Button>

          {/* Avantages */}
          <div className="grid grid-cols-3 gap-4 mt-6">
            <div className="flex flex-col items-center gap-2 p-4 rounded-lg bg-muted/30">
              <Package className="h-6 w-6 text-purple-600" />
              <span className="text-xs text-center font-medium">
                Emballage<br />sécurisé
              </span>
            </div>
            <div className="flex flex-col items-center gap-2 p-4 rounded-lg bg-muted/30">
              <Truck className="h-6 w-6 text-blue-600" />
              <span className="text-xs text-center font-medium">
                Livraison<br />rapide
              </span>
            </div>
            <div className="flex flex-col items-center gap-2 p-4 rounded-lg bg-muted/30">
              <Shield className="h-6 w-6 text-green-600" />
              <span className="text-xs text-center font-medium">
                Paiement<br />sécurisé
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
