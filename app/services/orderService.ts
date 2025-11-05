import prisma from "@/app/api/prisma/client";

export type OrderStatus = "pending" | "processing" | "shipped" | "delivered" | "cancelled";

export interface OrderWithDetails {
  id: number;
  userId: string;
  status: string;
  total: number;
  paymentMethod: string | null;
  createdAt: Date;
  user: {
    firstName: string | null;
    lastName: string | null;
    email: string;
  };
  shippingAddress: {
    street: string;
    city: string;
    zipCode: string;
    country: string;
  };
  orderItems: {
    id: number;
    quantity: number;
    price: number;
    product: {
      id: number;
      title: string;
      image: string | null;
    };
  }[];
}

/**
 * Récupère toutes les commandes avec leurs détails
 */
export async function getAllOrders(): Promise<OrderWithDetails[]> {
  try {
    const orders = await prisma.order.findMany({
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        shippingAddress: {
          select: {
            street: true,
            city: true,
            zipCode: true,
            country: true,
          },
        },
        orderItems: {
          include: {
            product: {
              select: {
                id: true,
                title: true,
                image: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return orders;
  } catch (error) {
    console.error("Error fetching orders:", error);
    throw new Error("Impossible de récupérer les commandes");
  }
}

/**
 * Récupère une commande par son ID avec tous ses détails
 */
export async function getOrderById(orderId: number): Promise<OrderWithDetails | null> {
  try {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        shippingAddress: {
          select: {
            street: true,
            city: true,
            zipCode: true,
            country: true,
          },
        },
        orderItems: {
          include: {
            product: {
              select: {
                id: true,
                title: true,
                image: true,
              },
            },
          },
        },
      },
    });

    return order;
  } catch (error) {
    console.error("Error fetching order:", error);
    return null;
  }
}

/**
 * Met à jour le statut d'une commande
 */
export async function updateOrderStatus(
  orderId: number,
  newStatus: OrderStatus
): Promise<boolean> {
  try {
    await prisma.order.update({
      where: { id: orderId },
      data: { status: newStatus },
    });

    return true;
  } catch (error) {
    console.error("Error updating order status:", error);
    return false;
  }
}

/**
 * Récupère les statistiques des commandes par statut
 */
export async function getOrderStatsByStatus() {
  try {
    const orders = await prisma.order.findMany({
      select: {
        status: true,
        total: true,
      },
    });

    const statsByStatus = orders.reduce((acc, order) => {
      if (!acc[order.status]) {
        acc[order.status] = {
          count: 0,
          total: 0,
        };
      }
      acc[order.status].count++;
      acc[order.status].total += order.total;
      return acc;
    }, {} as Record<string, { count: number; total: number }>);

    return statsByStatus;
  } catch (error) {
    console.error("Error fetching order stats:", error);
    return {};
  }
}
