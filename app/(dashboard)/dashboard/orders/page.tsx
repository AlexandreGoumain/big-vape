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
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getAllOrders } from "@/app/services/orderService";
import OrderStatusSelect from "@/app/components/dashboard/OrderStatusSelect";

const statusTranslations: Record<string, string> = {
  pending: "En attente",
  processing: "En cours",
  shipped: "Expédié",
  delivered: "Livré",
  cancelled: "Annulé",
};

const paymentMethodTranslations: Record<string, string> = {
  card: "Carte bancaire",
  paypal: "PayPal",
  transfer: "Virement bancaire",
};

export default async function OrdersPage() {
  const orders = await getAllOrders();

  // Calculer le total de toutes les commandes
  const totalAmount = orders.reduce((sum, order) => sum + order.total, 0);

  return (
    <Card>
      <CardHeader className="px-7">
        <CardTitle>Commandes</CardTitle>
        <CardDescription>
          Gérer toutes les commandes ({orders.length} commande
          {orders.length > 1 ? "s" : ""})
        </CardDescription>
      </CardHeader>
      <CardContent>
        {orders.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">
            Aucune commande pour le moment
          </p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-left">Commande</TableHead>
                <TableHead className="text-left">Client</TableHead>
                <TableHead className="text-left">Statut</TableHead>
                <TableHead className="text-left">Date</TableHead>
                <TableHead className="text-left">Paiement</TableHead>
                <TableHead className="text-right">Total</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.map((order) => {
                const customerName =
                  order.user.firstName && order.user.lastName
                    ? `${order.user.firstName} ${order.user.lastName}`
                    : order.user.email.split("@")[0];

                return (
                  <TableRow key={order.id}>
                    <TableCell>
                      <p className="font-bold text-sm">#{order.id}</p>
                    </TableCell>
                    <TableCell>
                      <p className="font-bold text-sm">{customerName}</p>
                      <p className="text-xs text-muted-foreground">
                        {order.user.email}
                      </p>
                    </TableCell>
                    <TableCell>
                      <OrderStatusSelect
                        orderId={order.id}
                        currentStatus={order.status}
                      />
                    </TableCell>
                    <TableCell>
                      <p className="text-sm">
                        {new Date(order.createdAt).toLocaleDateString("fr-FR", {
                          day: "2-digit",
                          month: "2-digit",
                          year: "numeric",
                        })}
                      </p>
                    </TableCell>
                    <TableCell>
                      <p className="text-sm">
                        {order.paymentMethod
                          ? paymentMethodTranslations[order.paymentMethod] ||
                            order.paymentMethod
                          : "Non spécifié"}
                      </p>
                    </TableCell>
                    <TableCell>
                      <p className="text-sm text-right font-medium">
                        {(order.total / 100).toFixed(2)} €
                      </p>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
            <TableFooter>
              <TableRow>
                <TableCell colSpan={5}>
                  <p className="text-sm font-medium">Total des commandes</p>
                </TableCell>
                <TableCell>
                  <p className="text-sm font-bold text-right">
                    {(totalAmount / 100).toFixed(2)} €
                  </p>
                </TableCell>
              </TableRow>
            </TableFooter>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
