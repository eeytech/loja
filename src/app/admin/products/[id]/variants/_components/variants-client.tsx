"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { PencilIcon, PlusIcon, TrashIcon } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { NumericFormat } from "react-number-format";
import { toast } from "sonner";
import { z } from "zod";

import {
  createVariant,
  deleteVariant,
  updateVariant,
} from "@/actions/admin/variants";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatCentsToBRL } from "@/helpers/money";

type Variant = {
  id: string;
  name: string;
  slug: string;
  color: string;
  priceInCents: number;
  imageUrl: string;
};

type Props = {
  productId: string;
  productName: string;
  variants: Variant[];
};

const formSchema = z.object({
  name: z.string().trim().min(1, "Nome é obrigatório."),
  color: z.string().trim().min(1, "Cor é obrigatória."),
  priceInCents: z.number().int().positive("Preço deve ser maior que zero."),
  imageUrl: z.string().trim().url("URL da imagem inválida."),
});

type FormValues = z.infer<typeof formSchema>;

export function VariantsClient({ productId, productName, variants }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [formOpen, setFormOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [editingVariant, setEditingVariant] = useState<Variant | null>(null);
  const [deletingVariant, setDeletingVariant] = useState<Variant | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      color: "",
      priceInCents: 0,
      imageUrl: "",
    },
  });

  const openCreate = () => {
    setEditingVariant(null);
    form.reset({ name: "", color: "", priceInCents: 0, imageUrl: "" });
    setFormOpen(true);
  };

  const openEdit = (variant: Variant) => {
    setEditingVariant(variant);
    form.reset({
      name: variant.name,
      color: variant.color,
      priceInCents: variant.priceInCents,
      imageUrl: variant.imageUrl,
    });
    setFormOpen(true);
  };

  const openDelete = (variant: Variant) => {
    setDeletingVariant(variant);
    setDeleteOpen(true);
  };

  const onSubmit = (values: FormValues) => {
    startTransition(async () => {
      const result = editingVariant
        ? await updateVariant(editingVariant.id, productId, values)
        : await createVariant(productId, values);

      if (result.success) {
        toast.success(
          editingVariant
            ? "Variante atualizada com sucesso."
            : "Variante criada com sucesso.",
        );
        setFormOpen(false);
        router.refresh();
      } else {
        toast.error(result.error);
      }
    });
  };

  const onDelete = () => {
    if (!deletingVariant) return;
    startTransition(async () => {
      const result = await deleteVariant(deletingVariant.id, productId);
      if (result.success) {
        toast.success("Variante excluída com sucesso.");
        setDeleteOpen(false);
        router.refresh();
      } else {
        toast.error(result.error);
        setDeleteOpen(false);
      }
    });
  };

  return (
    <>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Variantes</h1>
          <p className="text-muted-foreground text-sm">
            Produto: <strong>{productName}</strong> — {variants.length}{" "}
            variante(s).
          </p>
        </div>
        <Button onClick={openCreate} size="sm">
          <PlusIcon className="mr-2 h-4 w-4" />
          Nova Variante
        </Button>
      </div>

      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Variante</TableHead>
              <TableHead>Cor</TableHead>
              <TableHead>Preço</TableHead>
              <TableHead>Imagem</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {variants.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="text-muted-foreground py-10 text-center text-sm"
                >
                  Nenhuma variante cadastrada. Crie a primeira!
                </TableCell>
              </TableRow>
            ) : (
              variants.map((variant) => (
                <TableRow key={variant.id}>
                  <TableCell>
                    <p className="font-medium">{variant.name}</p>
                    <p className="text-muted-foreground font-mono text-xs">
                      {variant.slug}
                    </p>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div
                        className="h-5 w-5 rounded-full border"
                        style={{ backgroundColor: variant.color }}
                      />
                      <Badge variant="outline">{variant.color}</Badge>
                    </div>
                  </TableCell>
                  <TableCell className="font-medium">
                    {formatCentsToBRL(variant.priceInCents)}
                  </TableCell>
                  <TableCell>
                    {variant.imageUrl ? (
                      <div className="relative h-10 w-10 overflow-hidden rounded">
                        <Image
                          src={variant.imageUrl}
                          alt={variant.name}
                          fill
                          className="object-cover"
                          sizes="40px"
                        />
                      </div>
                    ) : (
                      <span className="text-muted-foreground text-sm">—</span>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => openEdit(variant)}
                      >
                        <PencilIcon className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-destructive hover:text-destructive h-8 w-8"
                        onClick={() => openDelete(variant)}
                      >
                        <TrashIcon className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Form Dialog */}
      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingVariant ? "Editar Variante" : "Nova Variante"}
            </DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome da Variante</FormLabel>
                    <FormControl>
                      <Input placeholder="Ex: Preto, Prata, 16GB…" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="color"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Cor (hex ou nome CSS)</FormLabel>
                    <FormControl>
                      <div className="flex gap-2">
                        <Input
                          type="color"
                          className="h-9 w-12 cursor-pointer p-1"
                          value={field.value.startsWith("#") ? field.value : "#000000"}
                          onChange={(e) => field.onChange(e.target.value)}
                        />
                        <Input
                          placeholder="#000000 ou black"
                          {...field}
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="priceInCents"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Preço (R$)</FormLabel>
                    <FormControl>
                      <NumericFormat
                        thousandSeparator="."
                        decimalSeparator=","
                        prefix="R$ "
                        decimalScale={2}
                        fixedDecimalScale
                        customInput={Input}
                        placeholder="R$ 0,00"
                        value={field.value / 100}
                        onValueChange={(values) =>
                          field.onChange(
                            Math.round((values.floatValue ?? 0) * 100),
                          )
                        }
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="imageUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>URL da Imagem</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="https://exemplo.com/imagem.jpg"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {form.watch("imageUrl") && (
                <div className="relative h-32 w-full overflow-hidden rounded-md border">
                  <Image
                    src={form.watch("imageUrl")}
                    alt="Preview"
                    fill
                    className="object-contain"
                    sizes="100%"
                    onError={() => {}}
                  />
                </div>
              )}

              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setFormOpen(false)}
                >
                  Cancelar
                </Button>
                <Button type="submit" disabled={isPending}>
                  {isPending ? "Salvando…" : "Salvar"}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir variante?</AlertDialogTitle>
            <AlertDialogDescription>
              Você está prestes a excluir a variante{" "}
              <strong>{deletingVariant?.name}</strong>. Variantes presentes em
              pedidos não podem ser excluídas.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isPending}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={onDelete}
              disabled={isPending}
              className="bg-destructive hover:bg-destructive/90 text-white"
            >
              {isPending ? "Excluindo…" : "Excluir"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
