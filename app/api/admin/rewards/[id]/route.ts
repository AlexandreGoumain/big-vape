import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

// Mettre à jour une récompense (Admin uniquement)
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();

    if (!session?.user?.role || session.user.role !== "admin") {
      return NextResponse.json(
        { error: "Accès non autorisé" },
        { status: 403 }
      );
    }

    const rewardId = parseInt(params.id);
    if (isNaN(rewardId)) {
      return NextResponse.json(
        { error: "ID de récompense invalide" },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { title, description, pointsCost, type, value, stock, validDays, isActive } = body;

    const updateData: any = {};
    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (pointsCost !== undefined) updateData.pointsCost = pointsCost;
    if (type !== undefined) updateData.type = type;
    if (value !== undefined) updateData.value = value;
    if (stock !== undefined) updateData.stock = stock;
    if (validDays !== undefined) updateData.validDays = validDays;
    if (isActive !== undefined) updateData.isActive = isActive;

    const reward = await prisma.loyaltyReward.update({
      where: { id: rewardId },
      data: updateData,
    });

    return NextResponse.json(reward);
  } catch (error) {
    console.error("Error updating reward:", error);
    return NextResponse.json(
      { error: "Erreur lors de la mise à jour de la récompense" },
      { status: 500 }
    );
  }
}

// Supprimer une récompense (Admin uniquement)
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();

    if (!session?.user?.role || session.user.role !== "admin") {
      return NextResponse.json(
        { error: "Accès non autorisé" },
        { status: 403 }
      );
    }

    const rewardId = parseInt(params.id);
    if (isNaN(rewardId)) {
      return NextResponse.json(
        { error: "ID de récompense invalide" },
        { status: 400 }
      );
    }

    await prisma.loyaltyReward.delete({
      where: { id: rewardId },
    });

    return NextResponse.json({ message: "Récompense supprimée avec succès" });
  } catch (error) {
    console.error("Error deleting reward:", error);
    return NextResponse.json(
      { error: "Erreur lors de la suppression de la récompense" },
      { status: 500 }
    );
  }
}
