"use server";

import { hash } from "bcryptjs";
import prisma from "../api/prisma/client";

export async function registerUser(formData: FormData) {
  const name = formData.get("name") as string;
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  if (!name || !email || !password) {
    return { error: "Tous les champs sont requis" };
  }

  // Vérifier si l'utilisateur existe déjà
  const existingUser = await prisma.user.findUnique({
    where: { email },
  });

  if (existingUser) {
    return { error: "Cet email est déjà utilisé" };
  }

  // Hasher le mot de passe
  const hashedPassword = await hash(password, 10);

  // Créer l'utilisateur
  try {
    await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: "user",
      },
    });

    return { success: true };
  } catch (error) {
    console.error("Error creating user:", error);
    return { error: "Erreur lors de la création du compte" };
  }
}
