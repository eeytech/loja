import { getCategories } from "@/actions/admin/categories";

import { ProductForm } from "../_components/product-form";

export default async function NewProductPage() {
  const categories = await getCategories();
  return <ProductForm categories={categories} />;
}
