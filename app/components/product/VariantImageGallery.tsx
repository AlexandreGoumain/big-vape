"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface VariantImageGalleryProps {
  images: string[];
  productName: string;
  className?: string;
}

export default function VariantImageGallery({
  images,
  productName,
  className
}: VariantImageGalleryProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);

  // Réinitialiser l'index quand les images changent (nouvelle variante)
  useEffect(() => {
    setIsTransitioning(true);
    setCurrentIndex(0);

    const timer = setTimeout(() => {
      setIsTransitioning(false);
    }, 300);

    return () => clearTimeout(timer);
  }, [images]);

  const goToNext = () => {
    if (images.length <= 1) return;
    setIsTransitioning(true);
    setTimeout(() => {
      setCurrentIndex((prev) => (prev + 1) % images.length);
      setIsTransitioning(false);
    }, 150);
  };

  const goToPrevious = () => {
    if (images.length <= 1) return;
    setIsTransitioning(true);
    setTimeout(() => {
      setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
      setIsTransitioning(false);
    }, 150);
  };

  const goToIndex = (index: number) => {
    if (index === currentIndex) return;
    setIsTransitioning(true);
    setTimeout(() => {
      setCurrentIndex(index);
      setIsTransitioning(false);
    }, 150);
  };

  // S'assurer qu'il y a au moins une image
  const displayImages = images.length > 0 ? images : ["/placeholder-product.jpg"];
  const currentImage = displayImages[currentIndex];

  return (
    <div className={cn("space-y-4", className)}>
      {/* Image principale avec effet de transition */}
      <div className="relative aspect-square overflow-hidden rounded-2xl bg-muted/50 backdrop-blur-sm">
        {/* Image */}
        <div
          className={cn(
            "relative w-full h-full transition-all duration-300 ease-out",
            isTransitioning && "opacity-0 scale-95"
          )}
        >
          <Image
            src={currentImage}
            alt={`${productName} - Image ${currentIndex + 1}`}
            fill
            className="object-cover"
            priority={currentIndex === 0}
            sizes="(max-width: 768px) 100vw, 50vw"
          />
        </div>

        {/* Overlay gradient pour améliorer la visibilité des contrôles */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/0 via-black/0 to-black/20 pointer-events-none" />

        {/* Boutons de navigation (si plusieurs images) */}
        {displayImages.length > 1 && (
          <>
            <button
              onClick={goToPrevious}
              className={cn(
                "absolute left-4 top-1/2 -translate-y-1/2 z-10",
                "w-10 h-10 rounded-full bg-background/80 backdrop-blur-sm",
                "flex items-center justify-center",
                "hover:bg-background hover:scale-110",
                "transition-all duration-200",
                "shadow-lg"
              )}
            >
              <ChevronLeft className="w-5 h-5" />
            </button>

            <button
              onClick={goToNext}
              className={cn(
                "absolute right-4 top-1/2 -translate-y-1/2 z-10",
                "w-10 h-10 rounded-full bg-background/80 backdrop-blur-sm",
                "flex items-center justify-center",
                "hover:bg-background hover:scale-110",
                "transition-all duration-200",
                "shadow-lg"
              )}
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </>
        )}

        {/* Indicateur de position */}
        {displayImages.length > 1 && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 flex gap-2">
            {displayImages.map((_, index) => (
              <button
                key={index}
                onClick={() => goToIndex(index)}
                className={cn(
                  "w-2 h-2 rounded-full transition-all duration-300",
                  index === currentIndex
                    ? "w-8 bg-foreground"
                    : "bg-foreground/30 hover:bg-foreground/50"
                )}
              />
            ))}
          </div>
        )}

        {/* Badge "Nouveau" ou "Promo" (optionnel) */}
        {currentIndex === 0 && (
          <div className="absolute top-4 right-4 z-10">
            <div className="px-3 py-1 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 text-white text-xs font-bold uppercase shadow-lg animate-gradient">
              Premium
            </div>
          </div>
        )}
      </div>

      {/* Miniatures (si plusieurs images) */}
      {displayImages.length > 1 && (
        <div className="grid grid-cols-4 gap-2">
          {displayImages.map((image, index) => (
            <button
              key={index}
              onClick={() => goToIndex(index)}
              className={cn(
                "relative aspect-square rounded-lg overflow-hidden",
                "border-2 transition-all duration-200",
                "hover:scale-105",
                index === currentIndex
                  ? "border-foreground shadow-lg"
                  : "border-muted hover:border-foreground/50"
              )}
            >
              <Image
                src={image}
                alt={`${productName} - Miniature ${index + 1}`}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 25vw, 12.5vw"
              />

              {/* Overlay pour l'image non sélectionnée */}
              {index !== currentIndex && (
                <div className="absolute inset-0 bg-black/20" />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
