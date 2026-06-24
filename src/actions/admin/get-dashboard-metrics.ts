"use server";

import { count, eq, sum } from "drizzle-orm";

import { db } from "@/db";
import { orderTable, productTable, userTable } from "@/db/schema";
import { requireAdmin } from "@/lib/admin";

export async function getDashboardMetrics() {
  await requireAdmin();

  const [revenueResult] = await db
    .select({ total: sum(orderTable.totalPriceInCents) })
    .from(orderTable)
    .where(eq(orderTable.status, "paid"));

  const [ordersResult] = await db.select({ total: count() }).from(orderTable);

  const [customersResult] = await db
    .select({ total: count() })
    .from(userTable)
    .where(eq(userTable.role, "customer"));

  const [productsResult] = await db
    .select({ total: count() })
    .from(productTable);

  const recentOrders = await db.query.orderTable.findMany({
    limit: 5,
    orderBy: (orders, { desc }) => [desc(orders.createdAt)],
    columns: {
      id: true,
      recipientName: true,
      totalPriceInCents: true,
      status: true,
      createdAt: true,
    },
  });

  return {
    totalRevenue: Number(revenueResult.total ?? 0),
    totalOrders: Number(ordersResult.total),
    totalCustomers: Number(customersResult.total),
    totalProducts: Number(productsResult.total),
    recentOrders,
  };
}
