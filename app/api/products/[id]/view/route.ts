import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const productId = parseInt(params.id);
    const session = await auth();

    // Vérifier que le produit existe
    const product = await prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      return NextResponse.json(
        { error: "Produit non trouvé" },
        { status: 404 }
      );
    }

    // Enregistrer la vue
    await prisma.productView.create({
      data: {
        productId,
        userId: session?.user?.id || null, // Null si l'utilisateur n'est pas connecté
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error recording product view:", error);
    return NextResponse.json(
      { error: "Erreur lors de l'enregistrement de la vue" },
      { status: 500 }
    );
  }
}
