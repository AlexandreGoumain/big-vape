"use client";

import { useSession } from "next-auth/react";
import { Link } from "next-auth/react/components";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Package, ShoppingBag } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function OrdersPage() {
  const { isAuthenticated, isLoading } = useSession();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isAuthenticated) {
      fetchOrders();
    } else {
      setLoading(false);
    }
  }, [isAuthenticated]);

  const fetchOrders = async () => {
    try {
      const response = await fetch("/api/orders");
      if (response.ok) {
        const data = await response.json();
        setOrders(data);
      }
    } catch (error) {
      console.error("Error fetching orders:", error);
    } finally {
      setLoading(false);
    }
  };

  if (isLoading || loading) {
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
              Vous devez être connecté pour voir vos commandes
            </CardDescription>
          </CardHeader>
          <CardContent className="py-8">
            <Button asChild size="lg">
              <Link>Se connecter</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="container mx-auto px-4 py-16">
        <Card className="max-w-2xl mx-auto text-center">
          <CardHeader>
            <CardTitle className="text-2xl">Aucune commande</CardTitle>
            <CardDescription>
              Vous n&apos;avez pas encore passé de commande
            </CardDescription>
          </CardHeader>
          <CardContent className="py-8">
            <ShoppingBag className="w-24 h-24 mx-auto text-gray-300" />
          </CardContent>
          <CardContent>
            <Button asChild size="lg">
              <Link href="/products">Découvrir nos produits</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { label: string; variant: any }> = {
      pending: { label: "En attente", variant: "secondary" },
      processing: { label: "En cours", variant: "default" },
      shipped: { label: "Expédiée", variant: "default" },
      delivered: { label: "Livrée", variant: "default" },
      cancelled: { label: "Annulée", variant: "destructive" },
    };

    const config = statusConfig[status] || { label: status, variant: "secondary" };
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Mes commandes</h1>

      <div className="space-y-4">
        {orders.map((order) => (
          <Card key={order.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Package className="w-5 h-5" />
                    Commande #{order.id}
                  </CardTitle>
                  <CardDescription>
                    {new Date(order.createdAt).toLocaleDateString("fr-FR", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </CardDescription>
                </div>
                {getStatusBadge(order.status)}
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              {/* Articles */}
              <div className="space-y-2">
                {order.orderItems.map((item: any) => (
                  <div
                    key={item.id}
                    className="flex justify-between text-sm py-2"
                  >
                    <span>
                      {item.product.title} x{item.quantity}
                    </span>
                    <span className="font-medium">
                      {((item.price * item.quantity) / 100).toFixed(2)} €
                    </span>
                  </div>
                ))}
              </div>

              <Separator />

              {/* Total */}
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">
                  {order.orderItems.length} article(s)
                </span>
                <div className="text-right">
                  <p className="text-sm text-gray-600">Total</p>
                  <p className="text-lg font-bold">
                    {(order.total / 100).toFixed(2)} €
                  </p>
                </div>
              </div>

              {/* Adresse */}
              {order.shippingAddress && (
                <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded">
                  <p className="font-medium mb-1">Adresse de livraison:</p>
                  <p>{order.shippingAddress.street}</p>
                  <p>
                    {order.shippingAddress.zipCode} {order.shippingAddress.city}
                  </p>
                  <p>{order.shippingAddress.country}</p>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
