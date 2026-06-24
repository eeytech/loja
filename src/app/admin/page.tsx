import {
  PackageIcon,
  ShoppingBagIcon,
  TrendingUpIcon,
  UsersIcon,
} from "lucide-react";
import Link from "next/link";

import { getDashboardMetrics } from "@/actions/admin/get-dashboard-metrics";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatCentsToBRL } from "@/helpers/money";

const statusLabels: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  pending: { label: "Pendente", variant: "secondary" },
  paid: { label: "Pago", variant: "default" },
  canceled: { label: "Cancelado", variant: "destructive" },
};

export default async function AdminDashboardPage() {
  const metrics = await getDashboardMetrics();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground text-sm">
          Visão geral da sua loja.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Faturamento Total
            </CardTitle>
            <TrendingUpIcon className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">
              {formatCentsToBRL(metrics.totalRevenue)}
            </p>
            <p className="text-muted-foreground text-xs">
              Soma dos pedidos pagos
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total de Pedidos</CardTitle>
            <ShoppingBagIcon className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{metrics.totalOrders}</p>
            <p className="text-muted-foreground text-xs">Todos os status</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Clientes</CardTitle>
            <UsersIcon className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{metrics.totalCustomers}</p>
            <p className="text-muted-foreground text-xs">
              Contas cadastradas
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Produtos</CardTitle>
            <PackageIcon className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{metrics.totalProducts}</p>
            <p className="text-muted-foreground text-xs">
              Produtos cadastrados
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base font-semibold">
            Pedidos Recentes
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Data</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {metrics.recentOrders.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className="text-muted-foreground py-8 text-center text-sm"
                  >
                    Nenhum pedido encontrado.
                  </TableCell>
                </TableRow>
              ) : (
                metrics.recentOrders.map((order) => {
                  const status = statusLabels[order.status];
                  return (
                    <TableRow key={order.id}>
                      <TableCell className="font-mono text-xs">
                        <Link
                          href={`/admin/orders/${order.id}`}
                          className="hover:underline"
                        >
                          {order.id.slice(0, 8)}…
                        </Link>
                      </TableCell>
                      <TableCell className="font-medium">
                        {order.recipientName}
                      </TableCell>
                      <TableCell>
                        {formatCentsToBRL(order.totalPriceInCents)}
                      </TableCell>
                      <TableCell>
                        <Badge variant={status.variant}>{status.label}</Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground text-sm">
                        {new Intl.DateTimeFormat("pt-BR").format(
                          order.createdAt,
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
