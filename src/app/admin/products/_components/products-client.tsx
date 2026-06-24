"use client";

import {
  PackageIcon,
  PencilIcon,
  PlusIcon,
  SearchIcon,
  TrashIcon,
} from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useTransition } from "react";
import { toast } from "sonner";

import { deleteProduct } from "@/actions/admin/products";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

type Category = { id: string; name: string };

type Product = {
  id: string;
  name: string;
  slug: string;
  createdAt: Date;
  category: { id: string; name: string } | null;
  variants: { id: string }[];
};

type Props = {
  products: Product[];
  categories: Category[];
  search: string;
  categoryId: string;
};

export function ProductsClient({
  products,
  categories,
  search,
  categoryId,
}: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const updateFilter = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    router.push(`/admin/products?${params.toString()}`);
  };

  const handleDelete = (id: string, name: string) => {
    startTransition(async () => {
      const result = await deleteProduct(id);
      if (result.success) {
        toast.success(`Produto "${name}" excluído com sucesso.`);
        router.refresh();
      } else {
        toast.error(result.error);
      }
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Produtos</h1>
          <p className="text-muted-foreground text-sm">
            {products.length} produto(s) encontrado(s).
          </p>
        </div>
        <Button asChild size="sm">
          <Link href="/admin/products/new">
            <PlusIcon className="mr-2 h-4 w-4" />
            Novo Produto
          </Link>
        </Button>
      </div>

      <div className="flex gap-3">
        <div className="relative flex-1">
          <SearchIcon className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
          <Input
            placeholder="Buscar por nome ou descrição…"
            className="pl-9"
            defaultValue={search}
            onChange={(e) => updateFilter("search", e.target.value)}
          />
        </div>
        <Select
          value={categoryId || "all"}
          onValueChange={(v) => updateFilter("categoryId", v === "all" ? "" : v)}
        >
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Todas as categorias" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas as categorias</SelectItem>
            {categories.map((cat) => (
              <SelectItem key={cat.id} value={cat.id}>
                {cat.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>Categoria</TableHead>
              <TableHead>Variantes</TableHead>
              <TableHead>Criado em</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {products.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="text-muted-foreground py-10 text-center text-sm"
                >
                  Nenhum produto encontrado.
                </TableCell>
              </TableRow>
            ) : (
              products.map((product) => (
                <TableRow key={product.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="bg-muted flex h-8 w-8 items-center justify-center rounded">
                        <PackageIcon className="text-muted-foreground h-4 w-4" />
                      </div>
                      <div>
                        <p className="font-medium">{product.name}</p>
                        <p className="text-muted-foreground font-mono text-xs">
                          {product.slug}
                        </p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    {product.category ? (
                      <Badge variant="secondary">{product.category.name}</Badge>
                    ) : (
                      <span className="text-muted-foreground text-sm">—</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {product.variants.length} variante(s)
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground text-sm">
                    {new Intl.DateTimeFormat("pt-BR").format(product.createdAt)}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        asChild
                      >
                        <Link href={`/admin/products/${product.id}`}>
                          <PencilIcon className="h-4 w-4" />
                        </Link>
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-destructive hover:text-destructive h-8 w-8"
                          >
                            <TrashIcon className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Excluir produto?</AlertDialogTitle>
                            <AlertDialogDescription>
                              Você está prestes a excluir{" "}
                              <strong>{product.name}</strong> e todas as suas
                              variantes. Esta ação não pode ser desfeita.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel disabled={isPending}>
                              Cancelar
                            </AlertDialogCancel>
                            <AlertDialogAction
                              disabled={isPending}
                              className="bg-destructive hover:bg-destructive/90 text-white"
                              onClick={() =>
                                handleDelete(product.id, product.name)
                              }
                            >
                              {isPending ? "Excluindo…" : "Excluir"}
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
