import { NextRequest, NextResponse } from "next/server";
import {
  getVariantById,
  updateVariant,
  deleteVariant,
  getVariantPrice
} from "@/app/services/variantService";

/**
 * GET /api/variants/[id]
 * Récupère une variante par son ID
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const variantId = parseInt(params.id);

    if (isNaN(variantId)) {
      return NextResponse.json(
        { error: "ID de variante invalide" },
        { status: 400 }
      );
    }

    const variant = await getVariantById(variantId);

    if (!variant) {
      return NextResponse.json(
        { error: "Variante non trouvée" },
        { status: 404 }
      );
    }

    // Calculer le prix final
    const finalPrice = await getVariantPrice(variantId);

    return NextResponse.json({
      ...variant,
      finalPrice
    });
  } catch (error) {
    console.error("Erreur lors de la récupération de la variante:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération de la variante" },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/variants/[id]
 * Met à jour une variante
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const variantId = parseInt(params.id);

    if (isNaN(variantId)) {
      return NextResponse.json(
        { error: "ID de variante invalide" },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { sku, name, color, size, priceAdjustment, stock, image, isDefault } = body;

    const updatedVariant = await updateVariant(variantId, {
      sku,
      name,
      color,
      size,
      priceAdjustment,
      stock,
      image,
      isDefault
    });

    return NextResponse.json(updatedVariant);
  } catch (error: any) {
    console.error("Erreur lors de la mise à jour de la variante:", error);

    // Erreur de variante non trouvée
    if (error.code === 'P2025') {
      return NextResponse.json(
        { error: "Variante non trouvée" },
        { status: 404 }
      );
    }

    // Erreur de SKU duplicate
    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: "Ce SKU existe déjà" },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: "Erreur lors de la mise à jour de la variante" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/variants/[id]
 * Supprime une variante
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const variantId = parseInt(params.id);

    if (isNaN(variantId)) {
      return NextResponse.json(
        { error: "ID de variante invalide" },
        { status: 400 }
      );
    }

    await deleteVariant(variantId);

    return NextResponse.json(
      { message: "Variante supprimée avec succès" },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Erreur lors de la suppression de la variante:", error);

    // Erreur de variante non trouvée
    if (error.code === 'P2025') {
      return NextResponse.json(
        { error: "Variante non trouvée" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { error: "Erreur lors de la suppression de la variante" },
      { status: 500 }
    );
  }
}
