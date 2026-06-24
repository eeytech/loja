import { getCategories } from "@/actions/admin/categories";

import { CategoriesClient } from "./_components/categories-client";

export default async function AdminCategoriesPage() {
  const categories = await getCategories();
  return <CategoriesClient categories={categories} />;
}
