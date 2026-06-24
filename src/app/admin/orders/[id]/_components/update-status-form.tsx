"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { toast } from "sonner";

import { updateOrderStatus } from "@/actions/admin/orders";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState } from "react";

type OrderStatus = "pending" | "paid" | "canceled";

type Props = {
  orderId: string;
  currentStatus: OrderStatus;
};

const statusConfig: Record<OrderStatus, { label: string; variant: "secondary" | "default" | "destructive" }> = {
  pending: { label: "Pendente", variant: "secondary" },
  paid: { label: "Pago", variant: "default" },
  canceled: { label: "Cancelado", variant: "destructive" },
};

export function UpdateStatusForm({ orderId, currentStatus }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [selectedStatus, setSelectedStatus] = useState<OrderStatus>(currentStatus);

  const hasChanged = selectedStatus !== currentStatus;

  const handleUpdate = () => {
    startTransition(async () => {
      const result = await updateOrderStatus(orderId, { status: selectedStatus });
      if (result.success) {
        toast.success("Status do pedido atualizado com sucesso.");
        router.refresh();
      } else {
        toast.error(result.error);
      }
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Status do Pedido</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-2">
          <span className="text-muted-foreground text-sm">Atual:</span>
          <Badge variant={statusConfig[currentStatus].variant}>
            {statusConfig[currentStatus].label}
          </Badge>
        </div>

        <div className="space-y-2">
          <Select
            value={selectedStatus}
            onValueChange={(v) => setSelectedStatus(v as OrderStatus)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="pending">Pendente</SelectItem>
              <SelectItem value="paid">Pago</SelectItem>
              <SelectItem value="canceled">Cancelado</SelectItem>
            </SelectContent>
          </Select>

          <Button
            className="w-full"
            onClick={handleUpdate}
            disabled={isPending || !hasChanged}
          >
            {isPending ? "Atualizando…" : "Atualizar Status"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
