"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ChevronLeft } from "lucide-react";
import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
import { useState, useEffect } from "react";

export default function EditCategory() {
  const router = useRouter();
  const params = useParams();
  const categoryId = params.id as string;

  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [formData, setFormData] = useState({
    name: "",
    image: "",
  });

  useEffect(() => {
    // Charger la catégorie
    fetch(`/api/categories/${categoryId}`)
      .then((res) => res.json())
      .then((data) => {
        setFormData({
          name: data.name || "",
          image: data.image || "",
        });
        setLoadingData(false);
      })
      .catch((err) => {
        console.error("Error loading category:", err);
        alert("Erreur lors du chargement de la catégorie");
        setLoadingData(false);
      });
  }, [categoryId]);

  async function formSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch(`/api/categories/${categoryId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error("Failed to update category");
      }

      router.push("/dashboard/categories");
      router.refresh();
    } catch (error) {
      console.error("Error updating category:", error);
      alert("Erreur lors de la mise à jour de la catégorie");
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

  return (
    <>
      <form onSubmit={formSubmit}>
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" asChild>
            <Link href="/dashboard/categories">
              <ChevronLeft className="w-4 h-4" />
            </Link>
          </Button>
          <h1 className="text-xl font-bold tracking-tight">
            Modifier la catégorie
          </h1>
        </div>

        <Card className="max-w-7xl mx-auto mt-8">
          <CardHeader>
            <CardTitle>Détails</CardTitle>
            <CardDescription>
              Modifiez les informations de la catégorie ci-dessous.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-5">
              <div className="flex flex-col gap-2">
                <Label>Nom</Label>
                <Input
                  type="text"
                  className="w-full"
                  placeholder="Nom de la catégorie"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  required
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label>URL de l&apos;image</Label>
                <Input
                  type="text"
                  className="w-full"
                  placeholder="https://..."
                  value={formData.image}
                  onChange={(e) =>
                    setFormData({ ...formData, image: e.target.value })
                  }
                />
              </div>
              <div className="flex flex-row justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push("/dashboard/categories")}
                >
                  Annuler
                </Button>
                <Button type="submit" className="w-32" disabled={loading}>
                  {loading ? "Mise à jour..." : "Mettre à jour"}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </form>
    </>
  );
}
