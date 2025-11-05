import { NextRequest, NextResponse } from "next/server";
import prisma from "@/app/api/prisma/client";
import crypto from "crypto";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email } = body;

    if (!email) {
      return NextResponse.json(
        { error: "Email requis" },
        { status: 400 }
      );
    }

    // Trouver l'utilisateur
    const user = await prisma.user.findUnique({
      where: { email },
    });

    // Même si l'utilisateur n'existe pas, renvoyer un succès pour ne pas révéler les emails existants
    if (!user) {
      return NextResponse.json({
        message: "Si un compte existe avec cet email, un lien de réinitialisation a été envoyé",
      });
    }

    // Générer un token de réinitialisation
    const resetToken = crypto.randomBytes(32).toString("hex");
    const resetTokenExpires = new Date(Date.now() + 3600000); // 1 heure

    // Stocker le token dans la table VerificationToken
    await prisma.verificationToken.create({
      data: {
        identifier: email,
        token: resetToken,
        expires: resetTokenExpires,
      },
    });

    // Envoyer l'email (à implémenter avec votre service d'email)
    const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL}/reset-password?token=${resetToken}`;

    // TODO: Implémenter l'envoi d'email avec Resend
    // Pour l'instant, on retourne juste le succès
    console.log(`Reset password URL for ${email}: ${resetUrl}`);

    return NextResponse.json({
      message: "Si un compte existe avec cet email, un lien de réinitialisation a été envoyé",
    });
  } catch (error) {
    console.error("Error in forgot password:", error);
    return NextResponse.json(
      { error: "Erreur lors de la réinitialisation du mot de passe" },
      { status: 500 }
    );
  }
}
