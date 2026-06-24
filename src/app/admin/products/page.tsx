import { getCategories } from "@/actions/admin/categories";
import { getProducts } from "@/actions/admin/products";

import { ProductsClient } from "./_components/products-client";

type Props = {
  searchParams: Promise<{ search?: string; categoryId?: string }>;
};

export default async function AdminProductsPage({ searchParams }: Props) {
  const { search = "", categoryId = "" } = await searchParams;

  const [products, categories] = await Promise.all([
    getProducts(search, categoryId),
    getCategories(),
  ]);

  return (
    <ProductsClient
      products={products}
      categories={categories}
      search={search}
      categoryId={categoryId}
    />
  );
}
