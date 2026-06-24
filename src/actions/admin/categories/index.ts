"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import z from "zod";

import { db } from "@/db";
import { categoryTable, productTable } from "@/db/schema";
import { requireAdmin } from "@/lib/admin";
import { generateSlug } from "@/lib/slug";

type ActionResult = { success: true } | { success: false; error: string };

const categorySchema = z.object({
  name: z.string().trim().min(2, "Nome deve ter pelo menos 2 caracteres."),
});

export async function getCategories() {
  await requireAdmin();
  return db.query.categoryTable.findMany({
    orderBy: (c, { asc }) => [asc(c.name)],
  });
}

export async function createCategory(
  data: z.infer<typeof categorySchema>,
): Promise<ActionResult> {
  await requireAdmin();

  const parsed = categorySchema.safeParse(data);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message };
  }

  const slug = generateSlug(parsed.data.name);

  const existing = await db.query.categoryTable.findFirst({
    where: eq(categoryTable.slug, slug),
    columns: { id: true },
  });

  if (existing) {
    return { success: false, error: "Já existe uma categoria com esse nome." };
  }

  try {
    await db.insert(categoryTable).values({ name: parsed.data.name, slug });
    revalidatePath("/admin/categories");
    revalidatePath("/");
    return { success: true };
  } catch {
    return { success: false, error: "Erro ao criar categoria." };
  }
}

export async function updateCategory(
  id: string,
  data: z.infer<typeof categorySchema>,
): Promise<ActionResult> {
  await requireAdmin();

  const parsed = categorySchema.safeParse(data);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message };
  }

  const slug = generateSlug(parsed.data.name);

  const conflicting = await db.query.categoryTable.findFirst({
    where: eq(categoryTable.slug, slug),
    columns: { id: true },
  });

  if (conflicting && conflicting.id !== id) {
    return { success: false, error: "Já existe uma categoria com esse nome." };
  }

  try {
    await db
      .update(categoryTable)
      .set({ name: parsed.data.name, slug })
      .where(eq(categoryTable.id, id));

    revalidatePath("/admin/categories");
    revalidatePath("/");
    return { success: true };
  } catch {
    return { success: false, error: "Erro ao atualizar categoria." };
  }
}

export async function deleteCategory(id: string): Promise<ActionResult> {
  await requireAdmin();

  const productsUsingCategory = await db
    .select({ id: productTable.id })
    .from(productTable)
    .where(eq(productTable.categoryId, id))
    .limit(1);

  if (productsUsingCategory.length > 0) {
    return {
      success: false,
      error:
        "Esta categoria possui produtos associados. Remova ou mova os produtos antes de excluir.",
    };
  }

  try {
    await db.delete(categoryTable).where(eq(categoryTable.id, id));
    revalidatePath("/admin/categories");
    revalidatePath("/");
    return { success: true };
  } catch {
    return { success: false, error: "Erro ao excluir categoria." };
  }
}
