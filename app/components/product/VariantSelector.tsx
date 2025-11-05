"use client";

import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

export interface ProductVariant {
  id: number;
  sku: string;
  name: string;
  color?: string | null;
  size?: string | null;
  priceAdjustment?: number | null;
  stock: number;
  image?: string | null;
  isDefault: boolean;
}

interface VariantSelectorProps {
  variants: ProductVariant[];
  basePrice: number;
  onVariantChange: (variant: ProductVariant | null) => void;
  className?: string;
}

export default function VariantSelector({
  variants,
  basePrice,
  onVariantChange,
  className
}: VariantSelectorProps) {
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);

  // Extraire les couleurs et tailles uniques
  const colors = Array.from(new Set(variants.map(v => v.color).filter(Boolean))) as string[];
  const sizes = Array.from(new Set(variants.map(v => v.size).filter(Boolean))) as string[];

  // Sélectionner la variante par défaut au chargement
  useEffect(() => {
    const defaultVariant = variants.find(v => v.isDefault) || variants[0];
    if (defaultVariant) {
      setSelectedVariant(defaultVariant);
      setSelectedColor(defaultVariant.color || null);
      setSelectedSize(defaultVariant.size || null);
      onVariantChange(defaultVariant);
    }
  }, [variants, onVariantChange]);

  // Trouver la variante correspondante quand couleur ou taille change
  useEffect(() => {
    if (selectedColor || selectedSize) {
      const matchingVariant = variants.find(v => {
        const colorMatch = !selectedColor || v.color === selectedColor;
        const sizeMatch = !selectedSize || v.size === selectedSize;
        return colorMatch && sizeMatch;
      });

      if (matchingVariant) {
        setSelectedVariant(matchingVariant);
        onVariantChange(matchingVariant);
      }
    }
  }, [selectedColor, selectedSize, variants, onVariantChange]);

  const handleColorSelect = (color: string) => {
    setSelectedColor(color);
  };

  const handleSizeSelect = (size: string) => {
    setSelectedSize(size);
  };

  const getFinalPrice = () => {
    if (!selectedVariant) return basePrice;
    return basePrice + (selectedVariant.priceAdjustment || 0);
  };

  const isColorHex = (color: string) => {
    return /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(color);
  };

  // Pas de variantes = ne rien afficher
  if (variants.length === 0) return null;

  return (
    <div className={cn("space-y-8", className)}>
      {/* Prix avec animation */}
      <div className="flex items-baseline gap-3">
        <div className="text-4xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 bg-clip-text text-transparent animate-gradient">
          {(getFinalPrice() / 100).toFixed(2)}€
        </div>
        {selectedVariant && selectedVariant.priceAdjustment && selectedVariant.priceAdjustment !== 0 && (
          <div className="text-sm text-muted-foreground line-through">
            {(basePrice / 100).toFixed(2)}€
          </div>
        )}
      </div>

      {/* Sélecteur de couleur */}
      {colors.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold uppercase tracking-wider">
              Couleur
            </h3>
            {selectedColor && (
              <span className="text-sm font-medium text-muted-foreground">
                {selectedColor}
              </span>
            )}
          </div>

          <div className="flex flex-wrap gap-3">
            {colors.map((color) => {
              const isSelected = selectedColor === color;
              const variantForColor = variants.find(v => v.color === color);
              const isAvailable = variantForColor && variantForColor.stock > 0;

              return (
                <button
                  key={color}
                  onClick={() => isAvailable && handleColorSelect(color)}
                  disabled={!isAvailable}
                  className={cn(
                    "relative group",
                    "transition-all duration-300 ease-out",
                    !isAvailable && "opacity-40 cursor-not-allowed"
                  )}
                >
                  {/* Cercle de couleur avec effet glow */}
                  <div
                    className={cn(
                      "w-12 h-12 rounded-full border-2 transition-all duration-300",
                      "flex items-center justify-center",
                      isSelected
                        ? "border-foreground scale-110 shadow-lg"
                        : "border-muted hover:border-foreground/50 hover:scale-105",
                      !isAvailable && "relative overflow-hidden"
                    )}
                    style={{
                      backgroundColor: isColorHex(color) ? color : undefined,
                      boxShadow: isSelected
                        ? `0 0 20px ${isColorHex(color) ? color : "currentColor"}40`
                        : undefined
                    }}
                  >
                    {/* Si ce n'est pas un code hex, afficher le nom */}
                    {!isColorHex(color) && (
                      <span className="text-xs font-bold uppercase">
                        {color.substring(0, 2)}
                      </span>
                    )}

                    {/* Checkmark pour la sélection */}
                    {isSelected && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/20 rounded-full backdrop-blur-sm">
                        <Check className="w-6 h-6 text-white" strokeWidth={3} />
                      </div>
                    )}

                    {/* Ligne diagonale si indisponible */}
                    {!isAvailable && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-full h-0.5 bg-red-500 rotate-45 transform" />
                      </div>
                    )}
                  </div>

                  {/* Effet de glow au hover */}
                  {isAvailable && (
                    <div
                      className={cn(
                        "absolute inset-0 rounded-full blur-xl opacity-0 group-hover:opacity-30 transition-opacity duration-300",
                        "-z-10"
                      )}
                      style={{
                        backgroundColor: isColorHex(color) ? color : "currentColor"
                      }}
                    />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Sélecteur de taille */}
      {sizes.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold uppercase tracking-wider">
              Contenance
            </h3>
            {selectedSize && (
              <span className="text-sm font-medium text-muted-foreground">
                {selectedSize}
              </span>
            )}
          </div>

          <div className="grid grid-cols-3 gap-3">
            {sizes.map((size) => {
              const isSelected = selectedSize === size;
              const variantForSize = variants.find(v =>
                v.size === size && (!selectedColor || v.color === selectedColor)
              );
              const isAvailable = variantForSize && variantForSize.stock > 0;

              return (
                <button
                  key={size}
                  onClick={() => isAvailable && handleSizeSelect(size)}
                  disabled={!isAvailable}
                  className={cn(
                    "relative px-6 py-4 rounded-xl font-semibold text-sm",
                    "border-2 transition-all duration-300 ease-out",
                    "hover:scale-105 active:scale-95",
                    isSelected
                      ? "border-foreground bg-foreground text-background shadow-xl"
                      : "border-muted hover:border-foreground/50 hover:bg-muted/50",
                    !isAvailable && "opacity-40 cursor-not-allowed hover:scale-100"
                  )}
                >
                  <span className="relative z-10">{size}</span>

                  {/* Gradient animé pour la sélection */}
                  {isSelected && (
                    <div className="absolute inset-0 bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 rounded-xl animate-gradient" />
                  )}

                  {/* Badge indisponible */}
                  {!isAvailable && (
                    <div className="absolute top-1 right-1">
                      <span className="text-xs text-red-500">✕</span>
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Indicateur de stock */}
      {selectedVariant && (
        <div className="flex items-center gap-2 p-4 rounded-lg bg-muted/50 backdrop-blur-sm">
          <div
            className={cn(
              "w-2 h-2 rounded-full animate-pulse",
              selectedVariant.stock > 10
                ? "bg-green-500"
                : selectedVariant.stock > 0
                ? "bg-orange-500"
                : "bg-red-500"
            )}
          />
          <span className="text-sm font-medium">
            {selectedVariant.stock > 10
              ? "En stock"
              : selectedVariant.stock > 0
              ? `Plus que ${selectedVariant.stock} en stock !`
              : "Rupture de stock"}
          </span>
        </div>
      )}

      {/* Informations sur la variante sélectionnée */}
      {selectedVariant && (
        <div className="text-xs text-muted-foreground space-y-1 p-3 rounded-lg bg-muted/30">
          <div>
            <span className="font-semibold">Référence:</span> {selectedVariant.sku}
          </div>
          <div>
            <span className="font-semibold">Variante:</span> {selectedVariant.name}
          </div>
        </div>
      )}
    </div>
  );
}
