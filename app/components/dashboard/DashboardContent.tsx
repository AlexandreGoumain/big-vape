import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { EuroIcon, PackageOpen, ShoppingBag, User2 } from "lucide-react";
import { ChartCommande } from "./charts/ChartCommande";
import { getDashboardStats } from "@/app/services/dashboardService";

export default async function DashboardContent() {
  const stats = await getDashboardStats();
  return (
    <>
      <div className="grid gap-5 md:grid-cols-2 md:gap-8 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Revenus</CardTitle>
            <EuroIcon className="h-6 w-6 " />
          </CardHeader>
          <CardContent>
            <p className="flex flex-row items-center gap-2 text-2xl font-bold">
              {(stats.totalRevenue / 100).toFixed(2)} €
            </p>
            <p>sur {stats.ordersCount} commandes</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Commandes</CardTitle>
            <ShoppingBag className="h-6 w-6 " />
          </CardHeader>
          <CardContent>
            <p className="flex flex-row items-center gap-2 text-2xl font-bold">
              {stats.ordersCount}
            </p>
            <p>total de {stats.ordersCount} commandes</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Produits</CardTitle>
            <PackageOpen className="h-6 w-6 " />
          </CardHeader>
          <CardContent>
            <p className="flex flex-row items-center gap-2 text-2xl font-bold">
              {stats.productsCount}
            </p>
            <p>total de {stats.productsCount} produits</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Utilisateurs</CardTitle>
            <User2 className="h-6 w-6 " />
          </CardHeader>
          <CardContent>
            <p className="flex flex-row items-center gap-2 text-2xl font-bold">
              {stats.usersCount}
            </p>
            <p>nombre d&apos;utilisateurs</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 md:gap-4 lg:grid-cols-4 lg:gap-8 xl:grid-cols-3 xl:gap-12 mt-9">
        <Card className="sm:col-span-1 lg:col-span-2 xl:col-span-2">
          <CardHeader>
            <CardTitle>Commandes</CardTitle>
          </CardHeader>
          <CardDescription>Récapitulatif des commandes</CardDescription>
          <CardContent>
            <ChartCommande data={stats.monthlyStats} />
          </CardContent>
        </Card>

        <Card className="sm:col-span-1 lg:col-span-2 xl:col-span-1">
          <CardHeader>
            <CardTitle>Récentes ventes</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-6">
            {stats.recentSales.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Aucune vente récente
              </p>
            ) : (
              stats.recentSales.map((sale, index) => {
                const initials = sale.name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")
                  .toUpperCase();
                return (
                  <div key={index} className="flex flex-row items-center gap-4">
                    <Avatar className="hidden sm:flex h-10 w-10 bg-slate-500">
                      <AvatarFallback>{initials}</AvatarFallback>
                    </Avatar>
                    <div className="grid gap-1">
                      <p className="text-sm font-medium">{sale.name}</p>
                      <p className="text-xs text-slate-500">{sale.email}</p>
                    </div>
                    <p className="ml-auto text-sm font-medium">
                      + {(sale.amount / 100).toFixed(2)} €
                    </p>
                  </div>
                );
              })
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
}
