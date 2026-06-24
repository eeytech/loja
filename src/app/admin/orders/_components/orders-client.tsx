"use client";

import { SearchIcon } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";

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
import { formatCentsToBRL } from "@/helpers/money";

type Order = {
  id: string;
  recipientName: string;
  email: string;
  totalPriceInCents: number;
  status: "pending" | "paid" | "canceled";
  createdAt: Date;
  items: { id: string }[];
};

type Props = {
  orders: Order[];
  status: string;
  search: string;
};

const statusConfig = {
  pending: { label: "Pendente", variant: "secondary" as const },
  paid: { label: "Pago", variant: "default" as const },
  canceled: { label: "Cancelado", variant: "destructive" as const },
};

export function OrdersClient({ orders, status, search }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const updateFilter = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value && value !== "all") {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    router.push(`/admin/orders?${params.toString()}`);
  };

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Pedidos</h1>
        <p className="text-muted-foreground text-sm">
          {orders.length} pedido(s) encontrado(s).
        </p>
      </div>

      <div className="flex gap-3">
        <div className="relative flex-1">
          <SearchIcon className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
          <Input
            placeholder="Buscar por nome, e-mail ou CPF/CNPJ…"
            className="pl-9"
            defaultValue={search}
            onChange={(e) => updateFilter("search", e.target.value)}
          />
        </div>
        <Select
          value={status || "all"}
          onValueChange={(v) => updateFilter("status", v)}
        >
          <SelectTrigger className="w-44">
            <SelectValue placeholder="Todos os status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os status</SelectItem>
            <SelectItem value="pending">Pendente</SelectItem>
            <SelectItem value="paid">Pago</SelectItem>
            <SelectItem value="canceled">Cancelado</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Pedido</TableHead>
              <TableHead>Cliente</TableHead>
              <TableHead>Itens</TableHead>
              <TableHead>Total</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Data</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={7}
                  className="text-muted-foreground py-10 text-center text-sm"
                >
                  Nenhum pedido encontrado.
                </TableCell>
              </TableRow>
            ) : (
              orders.map((order) => {
                const config = statusConfig[order.status];
                return (
                  <TableRow key={order.id}>
                    <TableCell className="font-mono text-xs">
                      {order.id.slice(0, 8)}…
                    </TableCell>
                    <TableCell>
                      <p className="font-medium">{order.recipientName}</p>
                      <p className="text-muted-foreground text-xs">
                        {order.email}
                      </p>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {order.items.length} item(s)
                      </Badge>
                    </TableCell>
                    <TableCell className="font-medium">
                      {formatCentsToBRL(order.totalPriceInCents)}
                    </TableCell>
                    <TableCell>
                      <Badge variant={config.variant}>{config.label}</Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      {new Intl.DateTimeFormat("pt-BR").format(order.createdAt)}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm" asChild>
                        <Link href={`/admin/orders/${order.id}`}>
                          Ver detalhes
                        </Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
