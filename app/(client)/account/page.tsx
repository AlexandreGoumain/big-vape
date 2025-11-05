"use client";

import { useSession, signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { User, Package, ShoppingBag, Edit } from "lucide-react";
import Link from "next/link";

export default function AccountPage() {
  const { data: session, status } = useSession();
  const isLoading = status === "loading";
  const isAuthenticated = status === "authenticated";

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <p>Chargement...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="container mx-auto px-4 py-16">
        <Card className="max-w-2xl mx-auto text-center">
          <CardHeader>
            <CardTitle className="text-2xl">Connexion requise</CardTitle>
            <CardDescription>
              Vous devez être connecté pour accéder à votre compte
            </CardDescription>
          </CardHeader>
          <CardContent className="py-8">
            <Button asChild size="lg">
              <Link href="/login">Se connecter</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const user = session?.user;
  const initials = user?.name?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || "U";

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Mon compte</h1>

      <div className="grid md:grid-cols-3 gap-6">
        {/* Profil */}
        <div className="md:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Profil</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col items-center text-center">
                <Avatar className="w-20 h-20 mb-4">
                  <AvatarFallback className="text-2xl">{initials}</AvatarFallback>
                </Avatar>
                <h2 className="text-xl font-semibold">
                  {user?.name || "Utilisateur"}
                </h2>
                <p className="text-sm text-gray-600">{user?.email}</p>
              </div>

              <div className="space-y-2">
                <Button asChild variant="default" className="w-full">
                  <Link href="/account/edit">
                    <Edit className="w-4 h-4 mr-2" />
                    Modifier mon profil
                  </Link>
                </Button>

                <Button variant="outline" onClick={() => signOut()} className="w-full">
                  Se déconnecter
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Actions rapides */}
        <div className="md:col-span-2 space-y-4">
          <Card className="cursor-pointer hover:shadow-lg transition-shadow">
            <Link href="/orders">
              <CardHeader>
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-primary/10 rounded-lg">
                    <Package className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <CardTitle>Mes commandes</CardTitle>
                    <CardDescription>
                      Voir l&apos;historique de vos commandes
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
            </Link>
          </Card>

          <Card className="cursor-pointer hover:shadow-lg transition-shadow">
            <Link href="/cart">
              <CardHeader>
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-primary/10 rounded-lg">
                    <ShoppingBag className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <CardTitle>Mon panier</CardTitle>
                    <CardDescription>
                      Voir les articles dans votre panier
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
            </Link>
          </Card>

          <Card className="bg-gray-50">
            <CardHeader>
              <CardTitle className="text-lg">Informations</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-gray-600">
              <div className="flex justify-between">
                <span>Email:</span>
                <span className="font-medium">{user?.email}</span>
              </div>
              <div className="flex justify-between">
                <span>Nom:</span>
                <span className="font-medium">{user?.name || "N/A"}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
