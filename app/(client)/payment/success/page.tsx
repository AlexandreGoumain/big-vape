"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { CheckCircle2, Loader2, XCircle } from "lucide-react";
import Link from "next/link";

export default function PaymentSuccessPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const sessionId = searchParams.get("session_id");
  const [status, setStatus] = useState<"loading" | "success" | "error">(
    "loading"
  );
  const [orderData, setOrderData] = useState<{
    orderId: number;
    customerEmail: string;
  } | null>(null);

  useEffect(() => {
    if (!sessionId) {
      setStatus("error");
      return;
    }

    // Vérifier le statut de la session Stripe
    const verifyPayment = async () => {
      try {
        const response = await fetch(
          `/api/checkout/verify?session_id=${sessionId}`
        );

        if (response.ok) {
          const data = await response.json();
          setOrderData(data);
          setStatus("success");
        } else {
          setStatus("error");
        }
      } catch (error) {
        console.error("Error verifying payment:", error);
        setStatus("error");
      }
    };

    verifyPayment();
  }, [sessionId]);

  if (status === "loading") {
    return (
      <div className="container mx-auto px-4 py-16">
        <Card className="max-w-2xl mx-auto text-center">
          <CardHeader>
            <CardTitle className="text-2xl">
              Vérification du paiement
            </CardTitle>
            <CardDescription>
              Veuillez patienter pendant que nous confirmons votre paiement...
            </CardDescription>
          </CardHeader>
          <CardContent className="py-8">
            <Loader2 className="w-16 h-16 mx-auto animate-spin text-blue-500" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="container mx-auto px-4 py-16">
        <Card className="max-w-2xl mx-auto text-center">
          <CardHeader>
            <XCircle className="w-16 h-16 mx-auto text-red-500 mb-4" />
            <CardTitle className="text-2xl text-red-600">
              Erreur de paiement
            </CardTitle>
            <CardDescription>
              Une erreur est survenue lors de la vérification de votre paiement.
            </CardDescription>
          </CardHeader>
          <CardContent className="py-4">
            <p className="text-sm text-gray-600">
              Si le montant a été débité de votre compte, veuillez contacter
              notre service client.
            </p>
          </CardContent>
          <CardFooter className="flex gap-4 justify-center">
            <Button asChild variant="outline">
              <Link href="/cart">Retour au panier</Link>
            </Button>
            <Button asChild>
              <Link href="/account">Mon compte</Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-16">
      <Card className="max-w-2xl mx-auto text-center">
        <CardHeader>
          <CheckCircle2 className="w-16 h-16 mx-auto text-green-500 mb-4" />
          <CardTitle className="text-2xl text-green-600">
            Paiement réussi !
          </CardTitle>
          <CardDescription>
            Votre commande a été confirmée avec succès
          </CardDescription>
        </CardHeader>
        <CardContent className="py-8 space-y-4">
          {orderData && (
            <>
              <div className="bg-gray-50 rounded-lg p-6 space-y-2">
                <p className="text-sm text-gray-600">Numéro de commande</p>
                <p className="text-2xl font-bold text-gray-900">
                  #{orderData.orderId}
                </p>
              </div>

              <div className="space-y-2 text-sm text-gray-600">
                <p>
                  Un email de confirmation a été envoyé à{" "}
                  <span className="font-semibold">{orderData.customerEmail}</span>
                </p>
                <p>
                  Vous pouvez suivre l'état de votre commande depuis votre espace
                  client.
                </p>
              </div>
            </>
          )}
        </CardContent>
        <CardFooter className="flex flex-col gap-4">
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
