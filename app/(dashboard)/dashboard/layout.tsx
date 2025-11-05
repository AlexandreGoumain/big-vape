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
import { CircleUser, MenuIcon } from "lucide-react";
import { Inter } from "next/font/google";
import { redirect } from "next/navigation";
import DashboardNavigation from "../../components/dashboard/DashboardNavigation";
import "../globals.css";
import { auth, signOut } from "@/auth";

const inter = Inter({ subsets: ["latin"] });

export default async function DashboardLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    const session = await auth();

    if (!session?.user || session.user.email !== "alexandre26goumain@gmail.com") {
        redirect("/");
    }

    return (
        <html lang="fr">
            <body className={inter.className}>
                <div className="flex w-full flex-col max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <header className="sticky top-0 flex h-16 items-center justify-between gap-4 bg-white border-b shadow-sm">
                        <nav className="hidden font-medium md:flex md:flex-row md:items-center md:gap-6">
                            <DashboardNavigation />
                        </nav>

                        <Sheet>
                            <SheetTrigger asChild>
                                <Button
                                    variant="outline"
                                    className="shrink-0 md:hidden"
                                >
                                    <MenuIcon className="w-6 h-6" />
                                </Button>
                            </SheetTrigger>
                            <SheetContent side={"left"}>
                                <nav className="flex flex-col gap-5 p-4 text-lg font-medium mt-4">
                                    <DashboardNavigation />
                                </nav>
                            </SheetContent>
                        </Sheet>

                        <div className="flex items-center">
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
                                    <DropdownMenuLabel>
                                        Mon compte
                                    </DropdownMenuLabel>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem asChild>
                                        <form
                                            action={async () => {
                                                "use server";
                                                await signOut();
                                            }}
                                        >
                                            <button type="submit" className="w-full text-left">
                                                Se déconnecter
                                            </button>
                                        </form>
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                    </header>
                    <main className="my-8">{children}</main>
                </div>
            </body>
        </html>
    );
}
