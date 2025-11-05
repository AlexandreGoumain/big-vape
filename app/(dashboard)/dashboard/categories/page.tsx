import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, PlusCircle } from "lucide-react";
import Link from "next/link";
import { getCategories } from "@/app/services/categoryService";

export default async function CategoriesPage() {
  const categories = await getCategories();

  return (
    <>
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Catégories</h1>
        <Button asChild size="sm">
          <Link href="/dashboard/categories/create">
            <PlusCircle className="h-3.5 w-3.5 mr-2" />
            Ajouter une catégorie
          </Link>
        </Button>
      </div>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Toutes les catégories</CardTitle>
          <CardDescription>
            Gérez vos catégories de produits ici.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nom</TableHead>
                <TableHead>Nombre de produits</TableHead>
                <TableHead>Date de création</TableHead>
                <TableHead>
                  <span className="sr-only">Actions</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {categories.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center">
                    Aucune catégorie trouvée
                  </TableCell>
                </TableRow>
              ) : (
                categories.map((category: any) => (
                  <TableRow key={category.id}>
                    <TableCell className="font-medium">
                      {category.name}
                    </TableCell>
                    <TableCell>
                      {category._count?.products || 0} produits
                    </TableCell>
                    <TableCell>
                      {new Date(category.createdAt).toLocaleDateString("fr-FR")}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            aria-haspopup="true"
                            size="icon"
                            variant="ghost"
                          >
                            <MoreHorizontal className="h-4 w-4" />
                            <span className="sr-only">Menu actions</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuItem asChild>
                            <Link
                              href={`/dashboard/categories/${category.id}/edit`}
                            >
                              Éditer
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <Link
                              href={`/dashboard/categories/${category.id}/delete`}
                            >
                              Supprimer
                            </Link>
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </>
  );
}
