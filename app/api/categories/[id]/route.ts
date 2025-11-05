import { NextRequest, NextResponse } from "next/server";
import prisma from "@/app/api/prisma/client";

// GET /api/categories/[id] - Récupérer une catégorie par ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);

    if (isNaN(id)) {
      return NextResponse.json({ error: "Invalid category ID" }, { status: 400 });
    }

    const category = await prisma.category.findUnique({
      where: { id },
      include: {
        products: true,
      },
    });

    if (!category) {
      return NextResponse.json({ error: "Category not found" }, { status: 404 });
    }

    return NextResponse.json(category, { status: 200 });
  } catch (error) {
    console.error("Error fetching category:", error);
    return NextResponse.json(
      { error: "Failed to fetch category" },
      { status: 500 }
    );
  }
}

// PUT /api/categories/[id] - Mettre à jour une catégorie
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);

    if (isNaN(id)) {
      return NextResponse.json({ error: "Invalid category ID" }, { status: 400 });
    }

    const body = await request.json();

    const updateData: any = {};
    if (body.name !== undefined) updateData.name = body.name;
    if (body.image !== undefined) updateData.image = body.image;

    const category = await prisma.category.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json(category, { status: 200 });
  } catch (error: any) {
    console.error("Error updating category:", error);

    if (error.code === "P2025") {
      return NextResponse.json({ error: "Category not found" }, { status: 404 });
    }

    return NextResponse.json(
      { error: "Failed to update category" },
      { status: 500 }
    );
  }
}

// DELETE /api/categories/[id] - Supprimer une catégorie
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);

    if (isNaN(id)) {
      return NextResponse.json({ error: "Invalid category ID" }, { status: 400 });
    }

    // Vérifier s'il y a des produits associés
    const category = await prisma.category.findUnique({
      where: { id },
      include: {
        _count: {
          select: { products: true },
        },
      },
    });

    if (!category) {
      return NextResponse.json({ error: "Category not found" }, { status: 404 });
    }

    if (category._count.products > 0) {
      return NextResponse.json(
        { error: "Cannot delete category with associated products" },
        { status: 400 }
      );
    }

    await prisma.category.delete({
      where: { id },
    });

    return NextResponse.json(
      { message: "Category deleted successfully" },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error deleting category:", error);

    if (error.code === "P2025") {
      return NextResponse.json({ error: "Category not found" }, { status: 404 });
    }

    return NextResponse.json(
      { error: "Failed to delete category" },
      { status: 500 }
    );
  }
}
