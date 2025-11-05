"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Mail, Check, AlertCircle } from "lucide-react";

export default function Newsletter() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<
    "idle" | "success" | "error" | "already-subscribed"
  >("idle");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email) {
      setStatus("error");
      setMessage("Veuillez entrer votre email");
      return;
    }

    setLoading(true);
    setStatus("idle");

    try {
      const response = await fetch("/api/newsletter", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        setStatus("success");
        setMessage(data.message);
        setEmail("");
      } else {
        if (response.status === 400 && data.error.includes("déjà inscrit")) {
          setStatus("already-subscribed");
        } else {
          setStatus("error");
        }
        setMessage(data.error || "Une erreur est survenue");
      }
    } catch (error) {
      setStatus("error");
      setMessage("Erreur lors de l'inscription");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-primary/5 rounded-lg p-6 md:p-8">
      <div className="flex flex-col items-center text-center max-w-2xl mx-auto">
        <Mail className="h-12 w-12 text-primary mb-4" />
        <h3 className="text-2xl font-bold mb-2">
          Restez informé de nos nouveautés
        </h3>
        <p className="text-muted-foreground mb-6">
          Inscrivez-vous à notre newsletter et recevez en exclusivité nos
          dernières offres, nouveaux produits et conseils.
        </p>

        <form
          onSubmit={handleSubmit}
          className="flex flex-col sm:flex-row gap-3 w-full max-w-md"
        >
          <Input
            type="email"
            placeholder="votre@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={loading}
            className="flex-1"
          />
          <Button type="submit" disabled={loading} className="whitespace-nowrap">
            {loading ? "Inscription..." : "S'inscrire"}
          </Button>
        </form>

        {status !== "idle" && (
          <div
            className={`mt-4 flex items-center gap-2 text-sm ${
              status === "success"
                ? "text-green-600"
                : status === "already-subscribed"
                ? "text-orange-600"
                : "text-red-600"
            }`}
          >
            {status === "success" ? (
              <Check className="h-4 w-4" />
            ) : (
              <AlertCircle className="h-4 w-4" />
            )}
            <span>{message}</span>
          </div>
        )}
      </div>
    </div>
  );
}
