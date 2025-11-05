import { NextRequest, NextResponse } from "next/server";
import { getProducts, createProduct } from "@/app/services/productService";

// GET /api/products - Récupérer tous les produits
export async function GET() {
  try {
    const products = await getProducts();
    return NextResponse.json(products, { status: 200 });
  } catch (error) {
    console.error("Error fetching products:", error);
    return NextResponse.json(
      { error: "Failed to fetch products" },
      { status: 500 }
    );
  }
}

// POST /api/products - Créer un nouveau produit
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validation basique
    if (!body.title || !body.price || !body.category_id) {
      return NextResponse.json(
        { error: "Missing required fields: title, price, category_id" },
        { status: 400 }
      );
    }

    const product = await createProduct({
      title: body.title,
      description: body.description,
      price: parseInt(body.price),
      image: body.image,
      category_id: parseInt(body.category_id),
      status: body.status || "draft",
      stock: body.stock ? parseInt(body.stock) : 0,
    });

    return NextResponse.json(product, { status: 201 });
  } catch (error) {
    console.error("Error creating product:", error);
    return NextResponse.json(
      { error: "Failed to create product" },
      { status: 500 }
    );
  }
}
