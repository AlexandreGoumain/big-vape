import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import prisma from "@/app/api/prisma/client";

// GET - Récupérer les avis d'un produit
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

    const reviews = await prisma.review.findMany({
      where: { productId },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // Calculer les statistiques
    const totalReviews = reviews.length;
    const averageRating =
      totalReviews > 0
        ? reviews.reduce((sum, review) => sum + review.rating, 0) / totalReviews
        : 0;

    const ratingDistribution = [1, 2, 3, 4, 5].map((rating) => ({
      rating,
      count: reviews.filter((r) => r.rating === rating).length,
    }));

    return NextResponse.json({
      reviews,
      stats: {
        totalReviews,
        averageRating: Math.round(averageRating * 10) / 10,
        ratingDistribution,
      },
    });
  } catch (error) {
    console.error("Error fetching reviews:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération des avis" },
      { status: 500 }
    );
  }
}

// POST - Créer un avis
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const productId = parseInt(params.id);

    if (isNaN(productId)) {
      return NextResponse.json(
        { error: "ID de produit invalide" },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { rating, comment } = body;

    // Validation
    if (!rating || rating < 1 || rating > 5) {
      return NextResponse.json(
        { error: "La note doit être entre 1 et 5" },
        { status: 400 }
      );
    }

    // Vérifier si l'utilisateur a déjà laissé un avis
    const existingReview = await prisma.review.findUnique({
      where: {
        userId_productId: {
          userId: user.id,
          productId,
        },
      },
    });

    if (existingReview) {
      return NextResponse.json(
        { error: "Vous avez déjà laissé un avis pour ce produit" },
        { status: 400 }
      );
    }

    // Créer l'avis
    const review = await prisma.review.create({
      data: {
        userId: user.id,
        productId,
        rating,
        comment: comment || null,
      },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });

    return NextResponse.json(review, { status: 201 });
  } catch (error) {
    console.error("Error creating review:", error);
    return NextResponse.json(
      { error: "Erreur lors de la création de l'avis" },
      { status: 500 }
    );
  }
}
