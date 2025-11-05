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

export default function DeleteCategory() {
  const router = useRouter();
  const params = useParams();
  const categoryId = params.id as string;

  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [category, setCategory] = useState<any>(null);

  useEffect(() => {
    // Charger la catégorie
    fetch(`/api/categories/${categoryId}`)
      .then((res) => res.json())
      .then((data) => {
        setCategory(data);
        setLoadingData(false);
      })
      .catch((err) => {
        console.error("Error loading category:", err);
        alert("Erreur lors du chargement de la catégorie");
        setLoadingData(false);
      });
  }, [categoryId]);

  async function handleDelete() {
    setLoading(true);

    try {
      const response = await fetch(`/api/categories/${categoryId}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to delete category");
      }

      router.push("/dashboard/categories");
      router.refresh();
    } catch (error: any) {
      console.error("Error deleting category:", error);
      alert(error.message || "Erreur lors de la suppression de la catégorie");
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

  if (!category) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p>Catégorie non trouvée</p>
      </div>
    );
  }

  return (
    <>
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" asChild>
          <Link href="/dashboard/categories">
            <ChevronLeft className="w-4 h-4" />
          </Link>
        </Button>
        <h1 className="text-xl font-bold tracking-tight">
          Supprimer la catégorie
        </h1>
      </div>

      <Card className="max-w-2xl mx-auto mt-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-destructive">
            <Trash2 className="w-5 h-5" />
            Confirmation de suppression
          </CardTitle>
          <CardDescription>
            Cette action est irréversible. La catégorie sera définitivement
            supprimée.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4">
            <div className="p-4 bg-muted rounded-lg">
              <p className="font-semibold">{category.name}</p>
              <p className="text-sm text-muted-foreground mt-1">
                {category.products?.length || 0} produits associés
              </p>
            </div>

            {category.products && category.products.length > 0 && (
              <div className="p-4 bg-destructive/10 border border-destructive rounded-lg">
                <p className="text-sm text-destructive font-medium">
                  Attention: Cette catégorie contient des produits. Vous ne
                  pouvez pas la supprimer tant qu&apos;elle contient des
                  produits.
                </p>
              </div>
            )}

            <div className="flex flex-row justify-end gap-2 mt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push("/dashboard/categories")}
                disabled={loading}
              >
                Annuler
              </Button>
              <Button
                type="button"
                variant="destructive"
                onClick={handleDelete}
                disabled={
                  loading ||
                  (category.products && category.products.length > 0)
                }
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
