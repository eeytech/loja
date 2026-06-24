import { ArrowLeftIcon, MapPinIcon, UserIcon } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import { getOrder } from "@/actions/admin/orders";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatCentsToBRL } from "@/helpers/money";

import { UpdateStatusForm } from "./_components/update-status-form";

type Props = { params: Promise<{ id: string }> };

const statusConfig = {
  pending: { label: "Pendente", variant: "secondary" as const },
  paid: { label: "Pago", variant: "default" as const },
  canceled: { label: "Cancelado", variant: "destructive" as const },
};

export default async function OrderDetailPage({ params }: Props) {
  const { id } = await params;
  const order = await getOrder(id);

  if (!order) notFound();

  const config = statusConfig[order.status];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild className="h-8 w-8">
          <Link href="/admin/orders">
            <ArrowLeftIcon className="h-4 w-4" />
          </Link>
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight">
              Pedido{" "}
              <span className="font-mono text-lg">{id.slice(0, 8)}…</span>
            </h1>
            <Badge variant={config.variant}>{config.label}</Badge>
          </div>
          <p className="text-muted-foreground text-sm">
            Realizado em{" "}
            {new Intl.DateTimeFormat("pt-BR", {
              dateStyle: "long",
              timeStyle: "short",
            }).format(order.createdAt)}
          </p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          {/* Items */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">
                Itens do Pedido ({order.items.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Produto</TableHead>
                    <TableHead className="text-center">Qtd</TableHead>
                    <TableHead className="text-right">Preço Unit.</TableHead>
                    <TableHead className="text-right">Subtotal</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {order.items.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-md border">
                            <Image
                              src={item.productVariant.imageUrl}
                              alt={item.productVariant.name}
                              fill
                              className="object-cover"
                              sizes="48px"
                            />
                          </div>
                          <div>
                            <p className="font-medium">
                              {item.productVariant.product.name}
                            </p>
                            <p className="text-muted-foreground text-sm">
                              {item.productVariant.name}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        {item.quantity}
                      </TableCell>
                      <TableCell className="text-right">
                        {formatCentsToBRL(item.priceInCents)}
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        {formatCentsToBRL(item.priceInCents * item.quantity)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <div className="flex justify-end border-t p-4">
                <div className="space-y-1 text-right">
                  <p className="text-muted-foreground text-sm">Total do Pedido</p>
                  <p className="text-2xl font-bold">
                    {formatCentsToBRL(order.totalPriceInCents)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Customer Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <UserIcon className="h-4 w-4" />
                Dados do Cliente
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-muted-foreground font-medium">Nome</p>
                  <p>{order.recipientName}</p>
                </div>
                <div>
                  <p className="text-muted-foreground font-medium">E-mail</p>
                  <p>{order.email}</p>
                </div>
                <div>
                  <p className="text-muted-foreground font-medium">Telefone</p>
                  <p>{order.phone}</p>
                </div>
                <div>
                  <p className="text-muted-foreground font-medium">CPF/CNPJ</p>
                  <p>{order.cpfOrCnpj}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Shipping Address */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <MapPinIcon className="h-4 w-4" />
                Endereço de Entrega
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm">
              <p className="font-medium">
                {order.street}, {order.number}
                {order.complement ? `, ${order.complement}` : ""}
              </p>
              <p className="text-muted-foreground">
                {order.neighborhood} — {order.city}/{order.state}
              </p>
              <p className="text-muted-foreground">CEP {order.zipCode}</p>
              <p className="text-muted-foreground">{order.country}</p>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar: Status + ID */}
        <div className="space-y-4">
          <UpdateStatusForm orderId={id} currentStatus={order.status} />

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Identificadores</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div>
                <p className="text-muted-foreground font-medium">ID do Pedido</p>
                <p className="font-mono text-xs break-all">{order.id}</p>
              </div>
              <Separator />
              <div>
                <p className="text-muted-foreground font-medium">ID do Usuário</p>
                <p className="font-mono text-xs break-all">{order.userId}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
