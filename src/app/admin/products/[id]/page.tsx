import Link from "next/link";
import { notFound } from "next/navigation";

import { getCategories } from "@/actions/admin/categories";
import { getProduct } from "@/actions/admin/products";
import { Button } from "@/components/ui/button";

import { ProductForm } from "../_components/product-form";

type Props = { params: Promise<{ id: string }> };

export default async function EditProductPage({ params }: Props) {
  const { id } = await params;

  const [product, categories] = await Promise.all([
    getProduct(id),
    getCategories(),
  ]);

  if (!product) notFound();

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <Button asChild variant="outline" size="sm">
          <Link href={`/admin/products/${id}/variants`}>
            Gerenciar Variantes ({product.variants.length})
          </Link>
        </Button>
      </div>
      <ProductForm categories={categories} product={product} />
    </div>
  );
}
