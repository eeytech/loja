"use server";

import { eq } from "drizzle-orm";

import { db } from "@/db";
import { shippingAddressTable } from "@/db/schema";
import { getSession } from "@/lib/session";

export async function getUserAddresses() {
  const session = await getSession();

  if (!session?.user?.id) {
    throw new Error("Usuário não autenticado");
  }

  try {
    const addresses = await db
      .select()
      .from(shippingAddressTable)
      .where(eq(shippingAddressTable.userId, session.user.id))
      .orderBy(shippingAddressTable.createdAt);

    return addresses;
  } catch (error) {
    console.error("Erro ao buscar endereços:", error);
    throw new Error("Erro ao buscar endereços");
  }
}
