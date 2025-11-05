"use client";

import { useKindeBrowserClient } from "@kinde-oss/kinde-auth-nextjs";
import { LoginLink, LogoutLink } from "@kinde-oss/kinde-auth-nextjs/components";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { User, Package, ShoppingBag } from "lucide-react";
import Link from "next/link";

export default function AccountPage() {
  const { user, isAuthenticated, isLoading } = useKindeBrowserClient();

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
              <LoginLink>Se connecter</LoginLink>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const initials = `${user?.given_name?.[0] || ""}${user?.family_name?.[0] || ""}`.toUpperCase() || "U";

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
                  {user?.given_name} {user?.family_name}
                </h2>
                <p className="text-sm text-gray-600">{user?.email}</p>
              </div>

              <Button variant="outline" asChild className="w-full">
                <LogoutLink>Se déconnecter</LogoutLink>
              </Button>
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
                <span>Prénom:</span>
                <span className="font-medium">{user?.given_name || "N/A"}</span>
              </div>
              <div className="flex justify-between">
                <span>Nom:</span>
                <span className="font-medium">{user?.family_name || "N/A"}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
