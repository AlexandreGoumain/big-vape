import { Inter } from "next/font/google";
import Navigation from "../components/storeFront/Navigation";
import { CartProvider } from "../context/CartContext";
import SessionProvider from "../components/SessionProvider";
import "../globals.css";

const inter = Inter({ subsets: ["latin"] });

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
