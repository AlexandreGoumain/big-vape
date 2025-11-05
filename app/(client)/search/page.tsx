"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import CardProduct from "@/app/components/storeFront/CardProduct";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Loader2, Search, SlidersHorizontal } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

interface Product {
  id: number;
  title: string;
  price: number;
  image: string | null;
  stock: number;
  category: {
    id: number;
    name: string;
  };
}

interface Category {
  id: number;
  name: string;
}

export default function SearchPage() {
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get("q") || "";

  const [query, setQuery] = useState(initialQuery);
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);

  // Filtres
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [minPrice, setMinPrice] = useState<string>("");
  const [maxPrice, setMaxPrice] = useState<string>("");
  const [inStock, setInStock] = useState(false);
  const [sortBy, setSortBy] = useState<string>("createdAt");
  const [sortOrder, setSortOrder] = useState<string>("desc");
  const [showFilters, setShowFilters] = useState(false);

  // Charger les catégories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch("/api/categories");
        if (response.ok) {
          const data = await response.json();
          setCategories(data);
        }
      } catch (error) {
        console.error("Error fetching categories:", error);
      }
    };
    fetchCategories();
  }, []);

  // Recherche de produits
  useEffect(() => {
    const searchProducts = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (query) params.append("q", query);
        if (selectedCategory !== "all")
          params.append("category", selectedCategory);
        if (minPrice) params.append("minPrice", (parseFloat(minPrice) * 100).toString());
        if (maxPrice) params.append("maxPrice", (parseFloat(maxPrice) * 100).toString());
        if (inStock) params.append("inStock", "true");
        params.append("sortBy", sortBy);
        params.append("sortOrder", sortOrder);

        const response = await fetch(`/api/products/search?${params.toString()}`);
        if (response.ok) {
          const data = await response.json();
          setProducts(data.products);
          setTotalCount(data.totalCount);
        }
      } catch (error) {
        console.error("Error searching products:", error);
      } finally {
        setLoading(false);
      }
    };

    searchProducts();
  }, [query, selectedCategory, minPrice, maxPrice, inStock, sortBy, sortOrder]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // La recherche se déclenche automatiquement via useEffect
  };

  const clearFilters = () => {
    setSelectedCategory("all");
    setMinPrice("");
    setMaxPrice("");
    setInStock(false);
    setSortBy("createdAt");
    setSortOrder("desc");
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Barre de recherche */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-4">Recherche de produits</h1>
        <form onSubmit={handleSearch} className="flex gap-2">
          <Input
            type="search"
            placeholder="Rechercher un produit..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-1"
          />
          <Button type="submit">
            <Search className="h-4 w-4 mr-2" />
            Rechercher
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => setShowFilters(!showFilters)}
          >
            <SlidersHorizontal className="h-4 w-4 mr-2" />
            Filtres
          </Button>
        </form>
      </div>

      <div className="grid md:grid-cols-4 gap-6">
        {/* Filtres latéraux */}
        <div
          className={`${showFilters ? "block" : "hidden"} md:block md:col-span-1`}
        >
          <Card>
            <CardHeader>
              <CardTitle>Filtres</CardTitle>
              <CardDescription>
                {totalCount} produit{totalCount > 1 ? "s" : ""} trouvé
                {totalCount > 1 ? "s" : ""}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Catégorie */}
              <div className="space-y-2">
                <Label>Catégorie</Label>
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger>
                    <SelectValue placeholder="Toutes les catégories" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Toutes les catégories</SelectItem>
                    {categories.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id.toString()}>
                        {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Separator />

              {/* Prix */}
              <div className="space-y-2">
                <Label>Fourchette de prix (€)</Label>
                <div className="grid grid-cols-2 gap-2">
                  <Input
                    type="number"
                    placeholder="Min"
                    value={minPrice}
                    onChange={(e) => setMinPrice(e.target.value)}
                    min="0"
                    step="0.01"
                  />
                  <Input
                    type="number"
                    placeholder="Max"
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(e.target.value)}
                    min="0"
                    step="0.01"
                  />
                </div>
              </div>

              <Separator />

              {/* Stock */}
              <div className="flex items-center justify-between">
                <Label htmlFor="in-stock">En stock uniquement</Label>
                <Switch
                  id="in-stock"
                  checked={inStock}
                  onCheckedChange={setInStock}
                />
              </div>

              <Separator />

              {/* Tri */}
              <div className="space-y-2">
                <Label>Trier par</Label>
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="createdAt">Plus récent</SelectItem>
                    <SelectItem value="price">Prix</SelectItem>
                    <SelectItem value="title">Nom</SelectItem>
                    <SelectItem value="stock">Stock</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Ordre</Label>
                <Select value={sortOrder} onValueChange={setSortOrder}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="asc">Croissant</SelectItem>
                    <SelectItem value="desc">Décroissant</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button
                variant="outline"
                className="w-full"
                onClick={clearFilters}
              >
                Réinitialiser les filtres
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Résultats */}
        <div className="md:col-span-3">
          {loading ? (
            <div className="flex justify-center items-center py-16">
              <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
            </div>
          ) : products.length === 0 ? (
            <Card>
              <CardContent className="py-16 text-center">
                <p className="text-gray-500 text-lg mb-2">
                  Aucun produit trouvé
                </p>
                <p className="text-sm text-gray-400">
                  Essayez de modifier vos critères de recherche
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid lg:grid-cols-3 md:grid-cols-2 sm:grid-cols-2 grid-cols-1 gap-6">
              {products.map((product) => (
                <CardProduct
                  key={product.id}
                  id={product.id}
                  title={product.title}
                  price={product.price}
                  category={product.category.name}
                  image={product.image || ""}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
