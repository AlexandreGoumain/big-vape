"use client";

import { useCart } from "@/app/context/CartContext";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Minus, Plus, Trash2, ShoppingBag } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export default function CartPage() {
  const { items, updateQuantity, removeItem, totalPrice, totalItems, clearCart } =
    useCart();

  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-16">
        <Card className="max-w-2xl mx-auto text-center">
          <CardHeader>
            <CardTitle className="text-2xl">Votre panier est vide</CardTitle>
            <CardDescription>
              Ajoutez des produits à votre panier pour commencer vos achats
            </CardDescription>
          </CardHeader>
          <CardContent className="py-8">
            <ShoppingBag className="w-24 h-24 mx-auto text-gray-300" />
          </CardContent>
          <CardFooter className="justify-center">
            <Button asChild size="lg">
              <Link href="/products">Découvrir nos produits</Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Mon panier</h1>

      <div className="grid md:grid-cols-3 gap-8">
        {/* Liste des produits */}
        <div className="md:col-span-2 space-y-4">
          {items.map((item) => (
            <Card key={item.id}>
              <CardContent className="p-6">
                <div className="flex gap-4">
                  {/* Image */}
                  <div className="relative w-24 h-24 flex-shrink-0 bg-gray-100 rounded-lg overflow-hidden">
                    {item.image ? (
                      <Image
                        src={item.image}
                        alt={item.title}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="flex items-center justify-center w-full h-full text-gray-400 text-xs">
                        Pas d&apos;image
                      </div>
                    )}
                  </div>

                  {/* Détails */}
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg">{item.title}</h3>
                    <p className="text-sm text-gray-600 mt-1">
                      {(item.price / 100).toFixed(2)} € / unité
                    </p>

                    {/* Contrôles quantité */}
                    <div className="flex items-center gap-3 mt-4">
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() =>
                          updateQuantity(item.productId, item.quantity - 1)
                        }
                      >
                        <Minus className="h-3 w-3" />
                      </Button>

                      <span className="w-12 text-center font-medium">
                        {item.quantity}
                      </span>

                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() =>
                          updateQuantity(item.productId, item.quantity + 1)
                        }
                      >
                        <Plus className="h-3 w-3" />
                      </Button>

                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 ml-auto text-red-500 hover:text-red-700 hover:bg-red-50"
                        onClick={() => removeItem(item.productId)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  {/* Prix total de la ligne */}
                  <div className="text-right">
                    <p className="font-bold text-lg">
                      {((item.price * item.quantity) / 100).toFixed(2)} €
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}

          <Button
            variant="outline"
            onClick={clearCart}
            className="w-full text-red-500 hover:text-red-700"
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Vider le panier
          </Button>
        </div>

        {/* Résumé de la commande */}
        <div>
          <Card className="sticky top-20">
            <CardHeader>
              <CardTitle>Résumé</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Articles ({totalItems})</span>
                <span className="font-medium">
                  {(totalPrice / 100).toFixed(2)} €
                </span>
              </div>

              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Livraison</span>
                <span className="font-medium">Gratuite</span>
              </div>

              <Separator />

              <div className="flex justify-between text-lg font-bold">
                <span>Total</span>
                <span>{(totalPrice / 100).toFixed(2)} €</span>
              </div>
            </CardContent>
            <CardFooter className="flex flex-col gap-2">
              <Button asChild size="lg" className="w-full">
                <Link href="/checkout">Passer la commande</Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="w-full">
                <Link href="/products">Continuer mes achats</Link>
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
}
