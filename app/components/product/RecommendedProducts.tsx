"use client";

import { useEffect, useState } from "react";
import CardProduct from "@/app/components/storeFront/CardProduct";
import { Loader2 } from "lucide-react";

interface RecommendedProduct {
  id: number;
  title: string;
  price: number;
  image: string;
  category: {
    id: number;
    name: string;
  };
}

interface RecommendedProductsProps {
  productId: number;
}

export default function RecommendedProducts({
  productId,
}: RecommendedProductsProps) {
  const [products, setProducts] = useState<RecommendedProduct[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRecommendations = async () => {
      try {
        const response = await fetch(
          `/api/products/${productId}/recommendations`
        );
        if (response.ok) {
          const data = await response.json();
          setProducts(data);
        }
      } catch (error) {
        console.error("Error fetching recommendations:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchRecommendations();
  }, [productId]);

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (products.length === 0) {
    return null;
  }

  return (
    <div className="mt-12">
      <h2 className="text-2xl font-bold mb-6">Produits recommandés</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {products.map((product) => (
          <CardProduct
            key={product.id}
            id={product.id}
            title={product.title}
            category={product.category.name}
            price={product.price}
            image={product.image || "/placeholder-product.png"}
          />
        ))}
      </div>
    </div>
  );
}
