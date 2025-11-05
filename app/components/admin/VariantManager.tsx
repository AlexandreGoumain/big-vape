"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Plus, Trash2, Save } from "lucide-react";
import { ImageUpload } from "@/app/components/upload/ImageUpload";

export interface Variant {
  id?: number;
  sku: string;
  name: string;
  color?: string;
  size?: string;
  priceAdjustment?: number;
  stock: number;
  image?: string;
  isDefault: boolean;
}

interface VariantManagerProps {
  productId?: number;
  basePrice: number;
  onVariantsChange?: (variants: Variant[]) => void;
  initialVariants?: Variant[];
}

export default function VariantManager({
  productId,
  basePrice,
  onVariantsChange,
  initialVariants = []
}: VariantManagerProps) {
  const [variants, setVariants] = useState<Variant[]>(initialVariants);
  const [newVariant, setNewVariant] = useState<Partial<Variant>>({
    sku: "",
    name: "",
    color: "",
    size: "",
    priceAdjustment: 0,
    stock: 0,
    image: "",
    isDefault: false
  });

  const addVariant = () => {
    if (!newVariant.name || !newVariant.sku) {
      alert("Le nom et le SKU sont requis");
      return;
    }

    const variant: Variant = {
      sku: newVariant.sku!,
      name: newVariant.name!,
      color: newVariant.color || undefined,
      size: newVariant.size || undefined,
      priceAdjustment: newVariant.priceAdjustment || 0,
      stock: newVariant.stock || 0,
      image: newVariant.image || undefined,
      isDefault: newVariant.isDefault || false
    };

    const updatedVariants = [...variants, variant];
    setVariants(updatedVariants);
    onVariantsChange?.(updatedVariants);

    // Réinitialiser le formulaire
    setNewVariant({
      sku: "",
      name: "",
      color: "",
      size: "",
      priceAdjustment: 0,
      stock: 0,
      image: "",
      isDefault: false
    });
  };

  const removeVariant = (index: number) => {
    const updatedVariants = variants.filter((_, i) => i !== index);
    setVariants(updatedVariants);
    onVariantsChange?.(updatedVariants);
  };

  const setDefaultVariant = (index: number) => {
    const updatedVariants = variants.map((v, i) => ({
      ...v,
      isDefault: i === index
    }));
    setVariants(updatedVariants);
    onVariantsChange?.(updatedVariants);
  };

  const generateSKU = () => {
    const timestamp = Date.now().toString(36).toUpperCase();
    const colorPart = newVariant.color ? newVariant.color.substring(0, 3).toUpperCase() : "VAR";
    const sizePart = newVariant.size ? newVariant.size.replace(/[^a-zA-Z0-9]/g, "").toUpperCase() : "";

    const sku = `VAP-${colorPart}${sizePart ? "-" + sizePart : ""}-${timestamp}`;
    setNewVariant({ ...newVariant, sku });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Gestion des variantes</CardTitle>
          <p className="text-sm text-muted-foreground">
            Ajoutez différentes variantes pour ce produit (couleurs, tailles, etc.)
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Liste des variantes existantes */}
          {variants.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-sm font-semibold">Variantes existantes</h3>
              {variants.map((variant, index) => (
                <Card key={index} className={variant.isDefault ? "border-primary" : ""}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold">{variant.name}</span>
                          {variant.isDefault && (
                            <span className="text-xs bg-primary text-primary-foreground px-2 py-0.5 rounded">
                              Par défaut
                            </span>
                          )}
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-sm text-muted-foreground">
                          <div>SKU: {variant.sku}</div>
                          {variant.color && <div>Couleur: {variant.color}</div>}
                          {variant.size && <div>Taille: {variant.size}</div>}
                          <div>Stock: {variant.stock}</div>
                          <div>
                            Prix: {((basePrice + (variant.priceAdjustment || 0)) / 100).toFixed(2)}€
                            {variant.priceAdjustment && variant.priceAdjustment !== 0 && (
                              <span className="ml-1">
                                ({variant.priceAdjustment > 0 ? "+" : ""}
                                {(variant.priceAdjustment / 100).toFixed(2)}€)
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        {!variant.isDefault && (
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => setDefaultVariant(index)}
                          >
                            Définir par défaut
                          </Button>
                        )}
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          onClick={() => removeVariant(index)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          <Separator />

          {/* Formulaire d'ajout de variante */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold">Ajouter une variante</h3>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="variant-name">Nom de la variante *</Label>
                <Input
                  id="variant-name"
                  placeholder="Ex: Bleu Glacier - 50ml"
                  value={newVariant.name || ""}
                  onChange={(e) => setNewVariant({ ...newVariant, name: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="variant-sku">
                  SKU *
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="ml-2"
                    onClick={generateSKU}
                  >
                    Générer
                  </Button>
                </Label>
                <Input
                  id="variant-sku"
                  placeholder="Ex: VAP-BLU-50ML-ABC123"
                  value={newVariant.sku || ""}
                  onChange={(e) => setNewVariant({ ...newVariant, sku: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="variant-color">Couleur</Label>
                <Input
                  id="variant-color"
                  placeholder="Ex: Bleu Glacier ou #0066CC"
                  value={newVariant.color || ""}
                  onChange={(e) => setNewVariant({ ...newVariant, color: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="variant-size">Taille / Contenance</Label>
                <Input
                  id="variant-size"
                  placeholder="Ex: 50ml, 100ml"
                  value={newVariant.size || ""}
                  onChange={(e) => setNewVariant({ ...newVariant, size: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="variant-price-adjustment">
                  Ajustement du prix (en centimes)
                </Label>
                <Input
                  id="variant-price-adjustment"
                  type="number"
                  placeholder="Ex: 100 pour +1€, -50 pour -0.50€"
                  value={newVariant.priceAdjustment || 0}
                  onChange={(e) => setNewVariant({ ...newVariant, priceAdjustment: parseInt(e.target.value) || 0 })}
                />
                <p className="text-xs text-muted-foreground">
                  Prix final: {((basePrice + (newVariant.priceAdjustment || 0)) / 100).toFixed(2)}€
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="variant-stock">Stock</Label>
                <Input
                  id="variant-stock"
                  type="number"
                  min="0"
                  value={newVariant.stock || 0}
                  onChange={(e) => setNewVariant({ ...newVariant, stock: parseInt(e.target.value) || 0 })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Image de la variante (optionnel)</Label>
              <ImageUpload
                value={newVariant.image || ""}
                onChange={(url) => setNewVariant({ ...newVariant, image: url })}
              />
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="variant-default"
                checked={newVariant.isDefault || false}
                onChange={(e) => setNewVariant({ ...newVariant, isDefault: e.target.checked })}
                className="h-4 w-4"
              />
              <Label htmlFor="variant-default" className="cursor-pointer">
                Définir comme variante par défaut
              </Label>
            </div>

            <Button type="button" onClick={addVariant} className="w-full">
              <Plus className="h-4 w-4 mr-2" />
              Ajouter la variante
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
