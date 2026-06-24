"use server";

import { and, eq, ilike, or } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import z from "zod";

import { db } from "@/db";
import { orderTable } from "@/db/schema";
import { requireAdmin } from "@/lib/admin";

type ActionResult = { success: true } | { success: false; error: string };

export async function getOrders(status?: string, search?: string) {
  await requireAdmin();

  const conditions = [];

  if (status && status !== "all") {
    conditions.push(
      eq(orderTable.status, status as "pending" | "paid" | "canceled"),
    );
  }

  if (search) {
    conditions.push(
      or(
        ilike(orderTable.recipientName, `%${search}%`),
        ilike(orderTable.email, `%${search}%`),
        ilike(orderTable.cpfOrCnpj, `%${search}%`),
      ),
    );
  }

  return db.query.orderTable.findMany({
    where: conditions.length > 0 ? and(...conditions) : undefined,
    orderBy: (orders, { desc }) => [desc(orders.createdAt)],
    with: {
      items: { columns: { id: true } },
    },
    columns: {
      id: true,
      recipientName: true,
      email: true,
      totalPriceInCents: true,
      status: true,
      createdAt: true,
    },
  });
}

export async function getOrder(id: string) {
  await requireAdmin();

  return db.query.orderTable.findFirst({
    where: eq(orderTable.id, id),
    with: {
      items: {
        with: {
          productVariant: {
            with: {
              product: { columns: { id: true, name: true } },
            },
          },
        },
      },
    },
  });
}

const updateStatusSchema = z.object({
  status: z.enum(["pending", "paid", "canceled"]),
});

export async function updateOrderStatus(
  orderId: string,
  data: z.infer<typeof updateStatusSchema>,
): Promise<ActionResult> {
  await requireAdmin();

  const parsed = updateStatusSchema.safeParse(data);
  if (!parsed.success) {
    return { success: false, error: "Status inválido." };
  }

  try {
    await db
      .update(orderTable)
      .set({ status: parsed.data.status })
      .where(eq(orderTable.id, orderId));

    revalidatePath(`/admin/orders/${orderId}`);
    revalidatePath("/admin/orders");
    return { success: true };
  } catch {
    return { success: false, error: "Erro ao atualizar status do pedido." };
  }
}
