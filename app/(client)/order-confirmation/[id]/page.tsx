"use client";

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
import { CheckCircle } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function OrderConfirmationPage() {
  const params = useParams();
  const orderId = params.id as string;
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Dans un vrai projet, on récupérerait les détails de la commande
    // Pour simplifier, on affiche juste un message de confirmation
    setLoading(false);
  }, [orderId]);

  return (
    <div className="container mx-auto px-4 py-16">
      <Card className="max-w-2xl mx-auto">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <CheckCircle className="w-20 h-20 text-green-500" />
          </div>
          <CardTitle className="text-3xl">Commande confirmée !</CardTitle>
          <CardDescription className="text-lg">
            Merci pour votre achat
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="bg-gray-50 p-6 rounded-lg">
            <div className="grid gap-2">
              <div className="flex justify-between">
                <span className="font-medium">Numéro de commande:</span>
                <span className="font-mono">#{orderId}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Statut:</span>
                <span className="text-green-600 font-medium">
                  En cours de traitement
                </span>
              </div>
            </div>
          </div>

          <Separator />

          <div className="text-center text-sm text-gray-600">
            <p>Vous recevrez un email de confirmation sous peu.</p>
            <p className="mt-2">
              Vous pouvez suivre votre commande dans votre espace client.
            </p>
          </div>
        </CardContent>

        <CardFooter className="flex flex-col gap-2">
          <Button asChild size="lg" className="w-full">
            <Link href="/orders">Voir mes commandes</Link>
          </Button>
          <Button asChild variant="outline" size="lg" className="w-full">
            <Link href="/products">Continuer mes achats</Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
