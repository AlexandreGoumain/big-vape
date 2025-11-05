import prisma from "@/app/api/prisma/client";

/**
 * Récupère toutes les variantes d'un produit
 */
export const getVariantsByProductId = async (productId: number) => {
  return await prisma.productVariant.findMany({
    where: { productId },
    orderBy: [
      { isDefault: 'desc' },
      { createdAt: 'asc' }
    ]
  });
};

/**
 * Récupère une variante par son ID
 */
export const getVariantById = async (id: number) => {
  return await prisma.productVariant.findUnique({
    where: { id },
    include: {
      product: {
        include: {
          category: true
        }
      }
    }
  });
};

/**
 * Récupère la variante par défaut d'un produit
 */
export const getDefaultVariant = async (productId: number) => {
  return await prisma.productVariant.findFirst({
    where: {
      productId,
      isDefault: true
    }
  });
};

/**
 * Crée une nouvelle variante
 */
export const createVariant = async (data: {
  productId: number;
  sku: string;
  name: string;
  color?: string;
  size?: string;
  priceAdjustment?: number;
  stock?: number;
  image?: string;
  isDefault?: boolean;
}) => {
  // Si cette variante est définie comme défaut, retirer le flag des autres
  if (data.isDefault) {
    await prisma.productVariant.updateMany({
      where: { productId: data.productId },
      data: { isDefault: false }
    });
  }

  return await prisma.productVariant.create({
    data
  });
};

/**
 * Crée plusieurs variantes en une seule transaction
 */
export const createVariants = async (
  productId: number,
  variants: Array<{
    sku: string;
    name: string;
    color?: string;
    size?: string;
    priceAdjustment?: number;
    stock?: number;
    image?: string;
    isDefault?: boolean;
  }>
) => {
  // S'assurer qu'une seule variante est marquée comme défaut
  const hasDefault = variants.some(v => v.isDefault);
  if (hasDefault) {
    await prisma.productVariant.updateMany({
      where: { productId },
      data: { isDefault: false }
    });
  }

  return await prisma.$transaction(
    variants.map(variant =>
      prisma.productVariant.create({
        data: {
          ...variant,
          productId
        }
      })
    )
  );
};

/**
 * Met à jour une variante
 */
export const updateVariant = async (
  id: number,
  data: {
    sku?: string;
    name?: string;
    color?: string;
    size?: string;
    priceAdjustment?: number;
    stock?: number;
    image?: string;
    isDefault?: boolean;
  }
) => {
  // Si on définit cette variante comme défaut, retirer le flag des autres
  if (data.isDefault) {
    const variant = await prisma.productVariant.findUnique({ where: { id } });
    if (variant) {
      await prisma.productVariant.updateMany({
        where: {
          productId: variant.productId,
          id: { not: id }
        },
        data: { isDefault: false }
      });
    }
  }

  return await prisma.productVariant.update({
    where: { id },
    data
  });
};

/**
 * Met à jour le stock d'une variante
 */
export const updateVariantStock = async (id: number, stock: number) => {
  return await prisma.productVariant.update({
    where: { id },
    data: { stock }
  });
};

/**
 * Supprime une variante
 */
export const deleteVariant = async (id: number) => {
  return await prisma.productVariant.delete({
    where: { id }
  });
};

/**
 * Supprime toutes les variantes d'un produit
 */
export const deleteVariantsByProductId = async (productId: number) => {
  return await prisma.productVariant.deleteMany({
    where: { productId }
  });
};

/**
 * Calcule le prix final d'une variante
 */
export const getVariantPrice = async (variantId: number) => {
  const variant = await prisma.productVariant.findUnique({
    where: { id: variantId },
    include: { product: true }
  });

  if (!variant) return null;

  const basePrice = variant.product.price;
  const adjustment = variant.priceAdjustment || 0;

  return basePrice + adjustment;
};

/**
 * Vérifie si une variante est disponible (stock > 0)
 */
export const isVariantAvailable = async (variantId: number, quantity: number = 1) => {
  const variant = await prisma.productVariant.findUnique({
    where: { id: variantId },
    select: { stock: true }
  });

  if (!variant) return false;

  return variant.stock >= quantity;
};

/**
 * Génère un SKU unique pour une variante
 */
export const generateSKU = (productId: number, color?: string, size?: string): string => {
  const parts = ['VAP', productId.toString().padStart(4, '0')];

  if (color) {
    parts.push(color.substring(0, 3).toUpperCase());
  }

  if (size) {
    parts.push(size.replace(/[^a-zA-Z0-9]/g, '').toUpperCase());
  }

  // Ajouter un timestamp pour garantir l'unicité
  parts.push(Date.now().toString(36).toUpperCase());

  return parts.join('-');
};
