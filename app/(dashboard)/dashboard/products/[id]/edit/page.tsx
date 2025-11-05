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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { ImageUpload } from "@/app/components/upload/ImageUpload";
import { ChevronLeft } from "lucide-react";
import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
import { useState, useEffect } from "react";

export default function EditProduct() {
  const router = useRouter();
  const params = useParams();
  const productId = params.id as string;

  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [categories, setCategories] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    price: "",
    status: "draft",
    category_id: "",
    stock: "0",
    image: "",
  });

  useEffect(() => {
    // Charger les catégories et le produit
    Promise.all([
      fetch("/api/categories").then((res) => res.json()),
      fetch(`/api/products/${productId}`).then((res) => res.json()),
    ])
      .then(([categoriesData, productData]) => {
        setCategories(categoriesData);
        setFormData({
          title: productData.title || "",
          description: productData.description || "",
          price: productData.price?.toString() || "",
          status: productData.status || "draft",
          category_id: productData.category_id?.toString() || "",
          stock: productData.stock?.toString() || "0",
          image: productData.image || "",
        });
        setLoadingData(false);
      })
      .catch((err) => {
        console.error("Error loading data:", err);
        alert("Erreur lors du chargement du produit");
        setLoadingData(false);
      });
  }, [productId]);

  async function formSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch(`/api/products/${productId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error("Failed to update product");
      }

      router.push("/dashboard/products");
      router.refresh();
    } catch (error) {
      console.error("Error updating product:", error);
      alert("Erreur lors de la mise à jour du produit");
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
            <Link href="/dashboard/products">
              <ChevronLeft className="w-4 h-4" />
            </Link>
          </Button>
          <h1 className="text-xl font-bold tracking-tight">Modifier le produit</h1>
        </div>

        <Card className="max-w-7xl mx-auto mt-8">
          <CardHeader>
            <CardTitle>Détails</CardTitle>
            <CardDescription>
              Modifiez les informations du produit ci-dessous.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-5">
              <div className="flex flex-col gap-2">
                <Label>Nom</Label>
                <Input
                  type="text"
                  className="w-full"
                  placeholder="Nom du produit"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  required
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label>Description</Label>
                <Textarea
                  className="w-full"
                  placeholder="Description du produit..."
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label>Prix (en centimes)</Label>
                <Input
                  type="number"
                  className="w-full"
                  placeholder="5000 (= 50€)"
                  value={formData.price}
                  onChange={(e) =>
                    setFormData({ ...formData, price: e.target.value })
                  }
                  required
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label>Stock</Label>
                <Input
                  type="number"
                  className="w-full"
                  placeholder="0"
                  value={formData.stock}
                  onChange={(e) =>
                    setFormData({ ...formData, stock: e.target.value })
                  }
                  required
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label>Catégorie</Label>
                <Select
                  value={formData.category_id}
                  onValueChange={(value) =>
                    setFormData({ ...formData, category_id: value })
                  }
                  required
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Sélectionner une catégorie" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id.toString()}>
                        {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex flex-col gap-3">
                <Label>Statut</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value) =>
                    setFormData({ ...formData, status: value })
                  }
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Sélectionner le statut" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Brouillon</SelectItem>
                    <SelectItem value="published">Publié</SelectItem>
                    <SelectItem value="archived">Archivé</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex flex-col gap-2">
                <Label>Image du produit</Label>
                <ImageUpload
                  value={formData.image}
                  onChange={(url) =>
                    setFormData({ ...formData, image: url })
                  }
                  disabled={loading}
                />
              </div>
              <div className="flex flex-row justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push("/dashboard/products")}
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
