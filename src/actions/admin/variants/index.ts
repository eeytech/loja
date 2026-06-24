"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import z from "zod";

import { db } from "@/db";
import { productVariantTable } from "@/db/schema";
import { requireAdmin } from "@/lib/admin";
import { generateSlug } from "@/lib/slug";

type ActionResult = { success: true } | { success: false; error: string };

const variantSchema = z.object({
  name: z.string().trim().min(1, "Nome é obrigatório."),
  color: z.string().trim().min(1, "Cor é obrigatória."),
  priceInCents: z
    .number()
    .int("Preço inválido.")
    .positive("Preço deve ser maior que zero."),
  imageUrl: z.string().trim().url("URL da imagem inválida."),
});

export async function getVariants(productId: string) {
  await requireAdmin();
  return db.query.productVariantTable.findMany({
    where: eq(productVariantTable.productId, productId),
    orderBy: (v, { asc }) => [asc(v.name)],
  });
}

export async function createVariant(
  productId: string,
  data: z.infer<typeof variantSchema>,
): Promise<ActionResult> {
  await requireAdmin();

  const parsed = variantSchema.safeParse(data);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message };
  }

  const baseSlug = generateSlug(parsed.data.name);
  const slug = `${baseSlug}-${Date.now()}`;

  try {
    await db
      .insert(productVariantTable)
      .values({ ...parsed.data, productId, slug });

    revalidatePath(`/admin/products/${productId}/variants`);
    revalidatePath(`/product-variant/${slug}`);
    return { success: true };
  } catch {
    return { success: false, error: "Erro ao criar variante." };
  }
}

export async function updateVariant(
  id: string,
  productId: string,
  data: z.infer<typeof variantSchema>,
): Promise<ActionResult> {
  await requireAdmin();

  const parsed = variantSchema.safeParse(data);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message };
  }

  try {
    await db
      .update(productVariantTable)
      .set(parsed.data)
      .where(eq(productVariantTable.id, id));

    revalidatePath(`/admin/products/${productId}/variants`);
    revalidatePath("/");
    return { success: true };
  } catch {
    return { success: false, error: "Erro ao atualizar variante." };
  }
}

export async function deleteVariant(
  id: string,
  productId: string,
): Promise<ActionResult> {
  await requireAdmin();

  try {
    await db
      .delete(productVariantTable)
      .where(eq(productVariantTable.id, id));

    revalidatePath(`/admin/products/${productId}/variants`);
    revalidatePath("/");
    return { success: true };
  } catch {
    return {
      success: false,
      error:
        "Não é possível excluir variantes presentes em pedidos.",
    };
  }
}
