import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/auth/verify-email?token=xxx - Vérifier l'email avec le token
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const token = searchParams.get("token");

    if (!token) {
      return NextResponse.json(
        { error: "Token de vérification manquant" },
        { status: 400 }
      );
    }

    // Chercher le token de vérification
    const verificationToken = await prisma.verificationToken.findUnique({
      where: { token },
    });

    if (!verificationToken) {
      return NextResponse.json(
        { error: "Token de vérification invalide" },
        { status: 400 }
      );
    }

    // Vérifier si le token n'a pas expiré
    if (verificationToken.expires < new Date()) {
      // Supprimer le token expiré
      await prisma.verificationToken.delete({
        where: { token },
      });

      return NextResponse.json(
        { error: "Le token de vérification a expiré" },
        { status: 400 }
      );
    }

    // Mettre à jour l'utilisateur pour marquer l'email comme vérifié
    const user = await prisma.user.update({
      where: { email: verificationToken.identifier },
      data: { emailVerified: new Date() },
    });

    // Supprimer le token utilisé
    await prisma.verificationToken.delete({
      where: { token },
    });

    return NextResponse.json(
      {
        message: "Email vérifié avec succès",
        user: {
          id: user.id,
          email: user.email,
          emailVerified: user.emailVerified,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Email verification error:", error);
    return NextResponse.json(
      { error: "Une erreur est survenue lors de la vérification" },
      { status: 500 }
    );
  }
}
