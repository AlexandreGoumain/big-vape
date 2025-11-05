"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ChevronLeft, Trash2 } from "lucide-react";
import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
import { useState, useEffect } from "react";

export default function DeleteProduct() {
  const router = useRouter();
  const params = useParams();
  const productId = params.id as string;

  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [product, setProduct] = useState<any>(null);

  useEffect(() => {
    // Charger le produit
    fetch(`/api/products/${productId}`)
      .then((res) => res.json())
      .then((data) => {
        setProduct(data);
        setLoadingData(false);
      })
      .catch((err) => {
        console.error("Error loading product:", err);
        alert("Erreur lors du chargement du produit");
        setLoadingData(false);
      });
  }, [productId]);

  async function handleDelete() {
    setLoading(true);

    try {
      const response = await fetch(`/api/products/${productId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete product");
      }

      router.push("/dashboard/products");
      router.refresh();
    } catch (error) {
      console.error("Error deleting product:", error);
      alert("Erreur lors de la suppression du produit");
    } finally {
      setLoading(false);
    }
  }

  if (loadingData) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p>Chargement...</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p>Produit non trouvé</p>
      </div>
    );
  }

  return (
    <>
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" asChild>
          <Link href="/dashboard/products">
            <ChevronLeft className="w-4 h-4" />
          </Link>
        </Button>
        <h1 className="text-xl font-bold tracking-tight">Supprimer le produit</h1>
      </div>

      <Card className="max-w-2xl mx-auto mt-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-destructive">
            <Trash2 className="w-5 h-5" />
            Confirmation de suppression
          </CardTitle>
          <CardDescription>
            Cette action est irréversible. Le produit sera définitivement supprimé.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4">
            <div className="p-4 bg-muted rounded-lg">
              <p className="font-semibold">{product.title}</p>
              <p className="text-sm text-muted-foreground mt-1">
                Prix: {(product.price / 100).toFixed(2)} €
              </p>
              <p className="text-sm text-muted-foreground">
                Catégorie: {product.category?.name || "N/A"}
              </p>
            </div>

            <div className="flex flex-row justify-end gap-2 mt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push("/dashboard/products")}
                disabled={loading}
              >
                Annuler
              </Button>
              <Button
                type="button"
                variant="destructive"
                onClick={handleDelete}
                disabled={loading}
                className="w-32"
              >
                {loading ? "Suppression..." : "Supprimer"}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </>
  );
}
