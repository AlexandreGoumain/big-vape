import { Inter } from "next/font/google";
import SessionProvider from "../components/SessionProvider";
import "../globals.css";

const inter = Inter({ subsets: ["latin"] });

export default function AuthLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="fr">
            <body className={inter.className}>
                <SessionProvider>
                    {children}
                </SessionProvider>
            </body>
        </html>
    );
}
