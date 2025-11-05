"use client";

import Link from "next/link";
import * as React from "react";
import { useRouter } from "next/navigation";

import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";
import { cn } from "@/lib/utils";
import { CogIcon, Sparkles, TrendingUp, Tag } from "lucide-react";

interface Category {
  id: number;
  name: string;
}

export default function FilterMenu() {
  const router = useRouter();
  const [categories, setCategories] = React.useState<Category[]>([]);

  React.useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch("/api/categories");
        if (response.ok) {
          const data = await response.json();
          setCategories(data);
        }
      } catch (error) {
        console.error("Error fetching categories:", error);
      }
    };
    fetchCategories();
  }, []);

  const handleCategoryClick = (categoryId: number) => {
    router.push(`/search?category=${categoryId}`);
  };

  const handleSortClick = (sortBy: string, sortOrder: string) => {
    router.push(`/search?sortBy=${sortBy}&sortOrder=${sortOrder}`);
  };

  return (
    <div className="justify-center flex my-6">
      <NavigationMenu>
        <NavigationMenuList>
          <NavigationMenuItem>
            <NavigationMenuTrigger>Parcourir</NavigationMenuTrigger>
            <NavigationMenuContent>
              <ul className="grid gap-3 p-6 md:w-[400px] lg:w-[500px] lg:grid-cols-[.75fr_1fr]">
                <li className="row-span-3">
                  <NavigationMenuLink asChild>
                    <a
                      className="flex h-full w-full select-none flex-col justify-end rounded-md bg-gradient-to-b from-muted/50 to-muted p-6 no-underline outline-none focus:shadow-md cursor-pointer"
                      onClick={() => router.push("/search")}
                    >
                      <CogIcon className="h-6 w-6" />
                      <div className="mb-2 mt-4 text-lg font-medium">
                        En ce moment :
                      </div>
                      <p className="text-sm leading-tight text-muted-foreground">
                        Découvrez tous les produits tendance.
                      </p>
                    </a>
                  </NavigationMenuLink>
                </li>
                <ListItem
                  icon={<TrendingUp className="h-4 w-4" />}
                  onClick={() => handleSortClick("createdAt", "desc")}
                  title="Nouveautés"
                >
                  Les derniers produits arrivés
                </ListItem>
                <ListItem
                  icon={<Sparkles className="h-4 w-4" />}
                  onClick={() => router.push("/search?inStock=true")}
                  title="En stock"
                >
                  Produits disponibles immédiatement
                </ListItem>
                <ListItem
                  icon={<Tag className="h-4 w-4" />}
                  onClick={() => handleSortClick("price", "asc")}
                  title="Prix croissant"
                >
                  Du moins cher au plus cher
                </ListItem>
              </ul>
            </NavigationMenuContent>
          </NavigationMenuItem>
          <NavigationMenuItem>
            <NavigationMenuTrigger>Catégories</NavigationMenuTrigger>
            <NavigationMenuContent>
              <ul className="grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-2 lg:w-[600px]">
                <ListItem
                  onClick={() => router.push("/search")}
                  title="Toutes les catégories"
                >
                  Voir tous les produits
                </ListItem>
                {categories.map((category) => (
                  <ListItem
                    key={category.id}
                    title={category.name}
                    onClick={() => handleCategoryClick(category.id)}
                  >
                    Découvrez nos produits {category.name.toLowerCase()}
                  </ListItem>
                ))}
              </ul>
            </NavigationMenuContent>
          </NavigationMenuItem>
          <NavigationMenuItem>
            <Link href="/search" legacyBehavior passHref>
              <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                Tous les produits
              </NavigationMenuLink>
            </Link>
          </NavigationMenuItem>
        </NavigationMenuList>
      </NavigationMenu>
    </div>
  );
}

const ListItem = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    title: string;
    icon?: React.ReactNode;
  }
>(({ className, title, children, icon, ...props }, ref) => {
  return (
    <li>
      <NavigationMenuLink asChild>
        <div
          ref={ref}
          className={cn(
            "block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground cursor-pointer",
            className
          )}
          {...props}
        >
          <div className="text-sm font-medium leading-none flex items-center gap-2">
            {icon}
            {title}
          </div>
          <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
            {children}
          </p>
        </div>
      </NavigationMenuLink>
    </li>
  );
});
ListItem.displayName = "ListItem";
