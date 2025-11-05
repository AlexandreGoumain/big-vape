import { NextRequest, NextResponse } from "next/server";
import prisma from "@/app/api/prisma/client";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get("q");
    const category = searchParams.get("category");
    const minPrice = searchParams.get("minPrice");
    const maxPrice = searchParams.get("maxPrice");
    const inStock = searchParams.get("inStock");
    const sortBy = searchParams.get("sortBy") || "createdAt";
    const sortOrder = searchParams.get("sortOrder") || "desc";

    // Construction de la requête de filtrage
    const where: any = {
      status: "published", // Seulement les produits publiés
    };

    // Recherche par texte
    if (query) {
      where.OR = [
        {
          title: {
            contains: query,
            mode: "insensitive",
          },
        },
        {
          description: {
            contains: query,
            mode: "insensitive",
          },
        },
      ];
    }

    // Filtrage par catégorie
    if (category && category !== "all") {
      where.category_id = parseInt(category);
    }

    // Filtrage par prix
    if (minPrice || maxPrice) {
      where.price = {};
      if (minPrice) {
        where.price.gte = parseInt(minPrice);
      }
      if (maxPrice) {
        where.price.lte = parseInt(maxPrice);
      }
    }

    // Filtrage par stock
    if (inStock === "true") {
      where.stock = {
        gt: 0,
      };
    }

    // Tri
    const orderBy: any = {};
    if (sortBy === "price") {
      orderBy.price = sortOrder;
    } else if (sortBy === "title") {
      orderBy.title = sortOrder;
    } else if (sortBy === "stock") {
      orderBy.stock = sortOrder;
    } else {
      orderBy.createdAt = sortOrder;
    }

    // Récupération des produits
    const products = await prisma.product.findMany({
      where,
      orderBy,
      include: {
        category: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    // Statistiques pour le filtrage
    const totalCount = await prisma.product.count({ where });

    return NextResponse.json({
      products,
      totalCount,
      filters: {
        query,
        category,
        minPrice,
        maxPrice,
        inStock,
        sortBy,
        sortOrder,
      },
    });
  } catch (error) {
    console.error("Error searching products:", error);
    return NextResponse.json(
      { error: "Erreur lors de la recherche des produits" },
      { status: 500 }
    );
  }
}
