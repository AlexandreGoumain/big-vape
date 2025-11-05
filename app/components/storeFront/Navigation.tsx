"use client";

import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { useSession, signIn, signOut } from "next-auth/react";
import { CircleUser, MenuIcon, ShoppingCart } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCart } from "@/app/context/CartContext";

const links = [
    {
        name: "Accueil",
        href: "/",
    },
    {
        name: "Produits",
        href: "/products",
    },
    {
        name: "Categories",
        href: "/categories",
    },
    {
        name: "Panier",
        href: "/cart",
    },
    {
        name: "Mon compte",
        href: "/account",
    },
];

export default function Navigation() {
    const pathname = usePathname();
    const { data: session, status } = useSession();
    const { totalItems } = useCart();
    const isAuthenticated = status === "authenticated";

    return (
        <>
            <nav className="hidden md:flex gap-4 items-center">
                {links.map((link) => (
                    link.href === "/cart" ? (
                        <Link
                            key={link.href}
                            href={link.href}
                            className={cn(
                                "flex items-center gap-1",
                                pathname === link.href
                                    ? "text-black"
                                    : "text-muted-foreground hover:text-foreground"
                            )}
                        >
                            <ShoppingCart className="w-4 h-4" />
                            {link.name}
                            {totalItems > 0 && (
                                <span className="ml-1 rounded-full bg-primary px-2 py-0.5 text-xs text-primary-foreground">
                                    {totalItems}
                                </span>
                            )}
                        </Link>
                    ) : (
                        <Link
                            key={link.href}
                            href={link.href}
                            className={cn(
                                pathname === link.href
                                    ? "text-black"
                                    : "text-muted-foreground hover:text-foreground"
                            )}
                        >
                            {link.name}
                        </Link>
                    )
                ))}
            </nav>

            <Sheet>
                <SheetTrigger asChild>
                    <Button variant="outline" className="shrink-0 md:hidden">
                        <MenuIcon className="w-6 h-6" />
                    </Button>
                </SheetTrigger>
                <SheetContent side={"left"}>
                    <nav className="flex flex-col gap-5 p-4 text-lg font-medium">
                        {links.map((link) => (
                            <Link
                                key={link.href}
                                href={link.href}
                                className={cn(
                                    pathname === link.href
                                        ? "text-black"
                                        : "text-muted-foreground hover:text-foreground"
                                )}
                            >
                                {link.name}
                            </Link>
                        ))}
                    </nav>
                </SheetContent>
            </Sheet>

            <div className="flex left-0 md:mt-0" id="user-menu">
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button
                            variant="outline"
                            size="icon"
                            className="rounded-full"
                        >
                            <CircleUser className="w-6 h-6" />
                        </Button>
                    </DropdownMenuTrigger>

                    <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Mon compte</DropdownMenuLabel>
                        <DropdownMenuSeparator />

                        {isAuthenticated ? (
                            <>
                                <DropdownMenuItem onClick={() => signOut()}>
                                    Se déconnecter
                                </DropdownMenuItem>
                            </>
                        ) : (
                            <>
                                <DropdownMenuItem asChild>
                                    <Link href="/login">Se connecter</Link>
                                </DropdownMenuItem>
                                <DropdownMenuItem asChild>
                                    <Link href="/register">S&apos;inscrire</Link>
                                </DropdownMenuItem>
                            </>
                        )}
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </>
    );
}
