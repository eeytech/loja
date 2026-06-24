import { ArrowLeftIcon } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

import { getProduct } from "@/actions/admin/products";
import { getVariants } from "@/actions/admin/variants";
import { Button } from "@/components/ui/button";

import { VariantsClient } from "./_components/variants-client";

type Props = { params: Promise<{ id: string }> };

export default async function VariantsPage({ params }: Props) {
  const { id } = await params;

  const product = await getProduct(id);
  if (!product) notFound();

  const variants = await getVariants(id);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" asChild className="h-8 w-8">
          <Link href={`/admin/products/${id}`}>
            <ArrowLeftIcon className="h-4 w-4" />
          </Link>
        </Button>
        <span className="text-muted-foreground text-sm">
          <Link href="/admin/products" className="hover:underline">
            Produtos
          </Link>{" "}
          /{" "}
          <Link href={`/admin/products/${id}`} className="hover:underline">
            {product.name}
          </Link>
        </span>
      </div>

      <VariantsClient
        productId={id}
        productName={product.name}
        variants={variants}
      />
    </div>
  );
}
