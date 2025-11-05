import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import prisma from "@/app/api/prisma/client";

// PATCH - Mettre à jour une adresse
export async function PATCH(
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

    const userAddressId = parseInt(params.id);

    // Vérifier que l'adresse appartient à l'utilisateur
    const userAddress = await prisma.userAddress.findFirst({
      where: {
        id: userAddressId,
        userId: user.id,
      },
    });

    if (!userAddress) {
      return NextResponse.json(
        { error: "Address not found" },
        { status: 404 }
      );
    }

    const body = await request.json();
    const { street, city, state, zipCode, country, label, isDefault } = body;

    // Si c'est la nouvelle adresse par défaut, retirer le flag des autres
    if (isDefault && !userAddress.isDefault) {
      await prisma.userAddress.updateMany({
        where: { userId: user.id },
        data: { isDefault: false },
      });
    }

    // Mettre à jour l'adresse
    if (street || city || state || zipCode || country) {
      await prisma.address.update({
        where: { id: userAddress.addressId },
        data: {
          ...(street && { street }),
          ...(city && { city }),
          ...(state !== undefined && { state }),
          ...(zipCode && { zipCode }),
          ...(country && { country }),
        },
      });
    }

    // Mettre à jour UserAddress
    const updatedUserAddress = await prisma.userAddress.update({
      where: { id: userAddressId },
      data: {
        ...(label !== undefined && { label }),
        ...(isDefault !== undefined && { isDefault }),
      },
      include: {
        address: true,
      },
    });

    return NextResponse.json(updatedUserAddress);
  } catch (error) {
    console.error("Error updating address:", error);
    return NextResponse.json(
      { error: "Erreur lors de la mise à jour de l'adresse" },
      { status: 500 }
    );
  }
}

// DELETE - Supprimer une adresse
export async function DELETE(
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

    const userAddressId = parseInt(params.id);

    // Vérifier que l'adresse appartient à l'utilisateur
    const userAddress = await prisma.userAddress.findFirst({
      where: {
        id: userAddressId,
        userId: user.id,
      },
    });

    if (!userAddress) {
      return NextResponse.json(
        { error: "Address not found" },
        { status: 404 }
      );
    }

    // Supprimer UserAddress (l'adresse physique peut rester pour les commandes)
    await prisma.userAddress.delete({
      where: { id: userAddressId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting address:", error);
    return NextResponse.json(
      { error: "Erreur lors de la suppression de l'adresse" },
      { status: 500 }
    );
  }
}
