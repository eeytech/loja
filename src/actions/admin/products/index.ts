"use server";

import { eq, ilike, or, type SQL } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import z from "zod";

import { db } from "@/db";
import { categoryTable, productTable, productVariantTable } from "@/db/schema";
import { requireAdmin } from "@/lib/admin";
import { generateSlug } from "@/lib/slug";

type ActionResult = { success: true } | { success: false; error: string };
type CreateResult = { success: true; id: string } | { success: false; error: string };

const productSchema = z.object({
  name: z.string().trim().min(2, "Nome deve ter pelo menos 2 caracteres."),
  categoryId: z.string().uuid("Selecione uma categoria válida."),
  description: z
    .string()
    .trim()
    .min(10, "Descrição deve ter pelo menos 10 caracteres."),
});

export async function getProducts(search?: string, categoryId?: string) {
  await requireAdmin();

  const conditions: SQL[] = [];

  if (search) {
    const searchFilter = or(
      ilike(productTable.name, `%${search}%`),
      ilike(productTable.description, `%${search}%`),
    );
    if (searchFilter) conditions.push(searchFilter);
  }

  if (categoryId) {
    conditions.push(eq(productTable.categoryId, categoryId));
  }

  return db.query.productTable.findMany({
    where: conditions.length > 0 ? (_, { and }) => and(...conditions) : undefined,
    with: {
      category: { columns: { id: true, name: true } },
      variants: { columns: { id: true } },
    },
    orderBy: (p, { desc }) => [desc(p.createdAt)],
  });
}

export async function getProduct(id: string) {
  await requireAdmin();
  return db.query.productTable.findFirst({
    where: eq(productTable.id, id),
    with: {
      category: { columns: { id: true, name: true } },
      variants: true,
    },
  });
}

export async function createProduct(
  data: z.infer<typeof productSchema>,
): Promise<CreateResult> {
  await requireAdmin();

  const parsed = productSchema.safeParse(data);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message };
  }

  const slug = generateSlug(parsed.data.name);

  const existing = await db.query.productTable.findFirst({
    where: eq(productTable.slug, slug),
    columns: { id: true },
  });

  if (existing) {
    return { success: false, error: "Já existe um produto com esse nome." };
  }

  const categoryExists = await db.query.categoryTable.findFirst({
    where: eq(categoryTable.id, parsed.data.categoryId),
    columns: { id: true },
  });

  if (!categoryExists) {
    return { success: false, error: "Categoria não encontrada." };
  }

  try {
    const [product] = await db
      .insert(productTable)
      .values({ ...parsed.data, slug })
      .returning({ id: productTable.id });

    revalidatePath("/admin/products");
    revalidatePath("/");
    return { success: true, id: product.id };
  } catch {
    return { success: false, error: "Erro ao criar produto." };
  }
}

export async function updateProduct(
  id: string,
  data: z.infer<typeof productSchema>,
): Promise<ActionResult> {
  await requireAdmin();

  const parsed = productSchema.safeParse(data);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message };
  }

  const slug = generateSlug(parsed.data.name);

  const conflicting = await db.query.productTable.findFirst({
    where: eq(productTable.slug, slug),
    columns: { id: true },
  });

  if (conflicting && conflicting.id !== id) {
    return { success: false, error: "Já existe um produto com esse nome." };
  }

  try {
    await db
      .update(productTable)
      .set({ ...parsed.data, slug })
      .where(eq(productTable.id, id));

    revalidatePath("/admin/products");
    revalidatePath(`/admin/products/${id}`);
    revalidatePath("/");
    return { success: true };
  } catch {
    return { success: false, error: "Erro ao atualizar produto." };
  }
}

export async function deleteProduct(id: string): Promise<ActionResult> {
  await requireAdmin();

  try {
    await db
      .delete(productVariantTable)
      .where(eq(productVariantTable.productId, id));
    await db.delete(productTable).where(eq(productTable.id, id));
    revalidatePath("/admin/products");
    revalidatePath("/");
    return { success: true };
  } catch {
    return { success: false, error: "Erro ao excluir produto." };
  }
}
