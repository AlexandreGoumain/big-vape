import { NextRequest, NextResponse } from "next/server";
import {
  getVariantsByProductId,
  createVariant,
  createVariants,
  generateSKU
} from "@/app/services/variantService";

/**
 * GET /api/products/[id]/variants
 * Récupère toutes les variantes d'un produit
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const productId = parseInt(params.id);

    if (isNaN(productId)) {
      return NextResponse.json(
        { error: "ID de produit invalide" },
        { status: 400 }
      );
    }

    const variants = await getVariantsByProductId(productId);

    return NextResponse.json(variants);
  } catch (error) {
    console.error("Erreur lors de la récupération des variantes:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération des variantes" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/products/[id]/variants
 * Crée une ou plusieurs variantes pour un produit
 *
 * Body peut être:
 * - Un objet pour créer une seule variante
 * - Un tableau pour créer plusieurs variantes
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const productId = parseInt(params.id);

    if (isNaN(productId)) {
      return NextResponse.json(
        { error: "ID de produit invalide" },
        { status: 400 }
      );
    }

    const body = await request.json();

    // Cas 1: Création multiple
    if (Array.isArray(body)) {
      // Générer les SKU si non fournis
      const variantsWithSKU = body.map(variant => ({
        ...variant,
        sku: variant.sku || generateSKU(productId, variant.color, variant.size)
      }));

      const createdVariants = await createVariants(productId, variantsWithSKU);

      return NextResponse.json(createdVariants, { status: 201 });
    }

    // Cas 2: Création simple
    const { name, color, size, priceAdjustment, stock, image, isDefault } = body;

    if (!name) {
      return NextResponse.json(
        { error: "Le nom de la variante est requis" },
        { status: 400 }
      );
    }

    // Générer un SKU si non fourni
    const sku = body.sku || generateSKU(productId, color, size);

    const variant = await createVariant({
      productId,
      sku,
      name,
      color,
      size,
      priceAdjustment,
      stock: stock || 0,
      image,
      isDefault: isDefault || false
    });

    return NextResponse.json(variant, { status: 201 });
  } catch (error: any) {
    console.error("Erreur lors de la création de la variante:", error);

    // Erreur de SKU duplicate
    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: "Ce SKU existe déjà" },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: "Erreur lors de la création de la variante" },
      { status: 500 }
    );
  }
}
