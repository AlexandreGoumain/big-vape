import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const newsletterSchema = z.object({
  email: z.string().email("Email invalide"),
});

// S'inscrire à la newsletter
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email } = newsletterSchema.parse(body);

    // Vérifier si l'email existe déjà
    const existing = await prisma.newsletter.findUnique({
      where: { email },
    });

    if (existing) {
      if (existing.isActive) {
        return NextResponse.json(
          { error: "Vous êtes déjà inscrit à la newsletter" },
          { status: 400 }
        );
      } else {
        // Réactiver l'abonnement si désactivé
        await prisma.newsletter.update({
          where: { email },
          data: { isActive: true },
        });
        return NextResponse.json({
          message: "Votre abonnement a été réactivé avec succès",
        });
      }
    }

    // Créer un nouvel abonnement
    await prisma.newsletter.create({
      data: { email },
    });

    return NextResponse.json(
      { message: "Inscription réussie à la newsletter" },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      );
    }

    console.error("Error subscribing to newsletter:", error);
    return NextResponse.json(
      { error: "Erreur lors de l'inscription à la newsletter" },
      { status: 500 }
    );
  }
}

// Se désinscrire de la newsletter
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get("email");

    if (!email) {
      return NextResponse.json(
        { error: "Email requis" },
        { status: 400 }
      );
    }

    const newsletter = await prisma.newsletter.findUnique({
      where: { email },
    });

    if (!newsletter) {
      return NextResponse.json(
        { error: "Email non trouvé dans la liste" },
        { status: 404 }
      );
    }

    // Désactiver l'abonnement au lieu de le supprimer
    await prisma.newsletter.update({
      where: { email },
      data: { isActive: false },
    });

    return NextResponse.json({
      message: "Vous avez été désinscrit de la newsletter",
    });
  } catch (error) {
    console.error("Error unsubscribing from newsletter:", error);
    return NextResponse.json(
      { error: "Erreur lors de la désinscription" },
      { status: 500 }
    );
  }
}
