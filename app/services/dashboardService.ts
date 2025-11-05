import prisma from "@/app/api/prisma/client";

export async function getDashboardStats() {
  try {
    // Récupérer les statistiques
    const [ordersData, productsCount, usersCount] = await Promise.all([
      // Commandes avec le total
      prisma.order.findMany({
        select: {
          total: true,
          createdAt: true,
          user: {
            select: {
              firstName: true,
              lastName: true,
              email: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
      }),
      // Nombre de produits
      prisma.product.count(),
      // Nombre d'utilisateurs
      prisma.user.count(),
    ]);

    // Calculer le revenu total
    const totalRevenue = ordersData.reduce((sum, order) => sum + order.total, 0);
    const ordersCount = ordersData.length;

    // Récentes ventes (5 dernières)
    const recentSales = ordersData.slice(0, 5).map((order) => ({
      name: `${order.user.firstName} ${order.user.lastName}`,
      email: order.user.email,
      amount: order.total,
    }));

    // Statistiques mensuelles (ventes par mois pour l'année en cours)
    const currentYear = new Date().getFullYear();
    const monthlyStats = Array.from({ length: 12 }, (_, i) => {
      const month = i + 1;
      const monthOrders = ordersData.filter((order) => {
        const orderDate = new Date(order.createdAt);
        return (
          orderDate.getFullYear() === currentYear &&
          orderDate.getMonth() + 1 === month
        );
      });

      const monthNames = [
        "Jan",
        "Fev",
        "Mar",
        "Avr",
        "Mai",
        "Jun",
        "Jul",
        "Aou",
        "Sep",
        "Oct",
        "Nov",
        "Dec",
      ];

      return {
        month: monthNames[i],
        ventes: monthOrders.reduce((sum, order) => sum + order.total, 0),
      };
    });

    return {
      totalRevenue,
      ordersCount,
      productsCount,
      usersCount,
      recentSales,
      monthlyStats,
    };
  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    // Retourner des valeurs par défaut en cas d'erreur
    return {
      totalRevenue: 0,
      ordersCount: 0,
      productsCount: 0,
      usersCount: 0,
      recentSales: [],
      monthlyStats: [],
    };
  }
}
