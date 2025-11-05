import { Inter } from "next/font/google";
import Navigation from "../components/storeFront/Navigation";
import { CartProvider } from "../context/CartContext";
import SessionProvider from "../components/SessionProvider";
import { Metadata } from "next";
import "../globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: {
    default: "Big Vape - Votre boutique de vape en ligne",
    template: "%s | Big Vape",
  },
  description:
    "Découvrez notre large sélection de produits de vape de qualité. Livraison rapide et paiement sécurisé.",
  keywords: [
    "vape",
    "cigarette électronique",
    "e-liquide",
    "vapotage",
    "boutique en ligne",
  ],
  authors: [{ name: "Big Vape" }],
  openGraph: {
    type: "website",
    locale: "fr_FR",
    siteName: "Big Vape",
    title: "Big Vape - Votre boutique de vape en ligne",
    description:
      "Découvrez notre large sélection de produits de vape de qualité. Livraison rapide et paiement sécurisé.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Big Vape - Votre boutique de vape en ligne",
    description:
      "Découvrez notre large sélection de produits de vape de qualité. Livraison rapide et paiement sécurisé.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default function ClientLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="fr">
            <body className={inter.className}>
                <SessionProvider>
                    <CartProvider>
                        <div className="flex w-full flex-col max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                            <header className="sticky top-0 flex h-16 items-center justify-between gap-4 bg-white border-b shadow-sm">
                                <Navigation />
                            </header>
                            <main>{children}</main>
                        </div>
                    </CartProvider>
                </SessionProvider>
            </body>
        </html>
    );
}
