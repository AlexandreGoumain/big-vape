import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const productId = parseInt(params.id);

    // Récupérer le produit actuel pour obtenir sa catégorie
    const currentProduct = await prisma.product.findUnique({
      where: { id: productId },
      select: { category_id: true },
    });

    if (!currentProduct) {
      return NextResponse.json(
        { error: "Produit non trouvé" },
        { status: 404 }
      );
    }

    // Récupérer les produits les plus populaires de la même catégorie
    const productsWithViews = await prisma.product.findMany({
      where: {
        category_id: currentProduct.category_id,
        status: "published",
        id: { not: productId }, // Exclure le produit actuel
      },
      include: {
        category: true,
        _count: {
          select: {
            views: true,
            reviews: true,
          },
        },
        reviews: {
          select: {
            rating: true,
          },
        },
      },
      take: 20, // Prendre plus de produits pour avoir un bon pool
    });

    // Calculer un score pour chaque produit
    const productsWithScore = productsWithViews.map((product) => {
      const viewCount = product._count.views;
      const reviewCount = product._count.reviews;
      const avgRating =
        reviewCount > 0
          ? product.reviews.reduce((sum, r) => sum + r.rating, 0) / reviewCount
          : 0;

      // Score basé sur: vues (40%) + avis (30%) + note moyenne (30%)
      const score = viewCount * 0.4 + reviewCount * 0.3 + avgRating * 6;

      return {
        ...product,
        score,
        avgRating,
      };
    });

    // Trier par score et prendre les 6 meilleurs
    const recommendations = productsWithScore
      .sort((a, b) => b.score - a.score)
      .slice(0, 6)
      .map((product) => ({
        id: product.id,
        title: product.title,
        description: product.description,
        price: product.price,
        image: product.image,
        stock: product.stock,
        category: {
          id: product.category.id,
          name: product.category.name,
        },
        viewCount: product._count.views,
        reviewCount: product._count.reviews,
        avgRating: product.avgRating,
      }));

    // Si pas assez de produits de la même catégorie, compléter avec des produits populaires
    if (recommendations.length < 6) {
      const additionalProducts = await prisma.product.findMany({
        where: {
          status: "published",
          id: {
            not: productId,
            notIn: recommendations.map((p) => p.id),
          },
        },
        include: {
          category: true,
          _count: {
            select: {
              views: true,
              reviews: true,
            },
          },
          reviews: {
            select: {
              rating: true,
            },
          },
        },
        orderBy: {
          views: {
            _count: "desc",
          },
        },
        take: 6 - recommendations.length,
      });

      const formattedAdditional = additionalProducts.map((product) => ({
        id: product.id,
        title: product.title,
        description: product.description,
        price: product.price,
        image: product.image,
        stock: product.stock,
        category: {
          id: product.category.id,
          name: product.category.name,
        },
        viewCount: product._count.views,
        reviewCount: product._count.reviews,
        avgRating:
          product._count.reviews > 0
            ? product.reviews.reduce((sum, r) => sum + r.rating, 0) /
              product._count.reviews
            : 0,
      }));

      recommendations.push(...formattedAdditional);
    }

    return NextResponse.json(recommendations);
  } catch (error) {
    console.error("Error fetching recommendations:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération des recommandations" },
      { status: 500 }
    );
  }
}
