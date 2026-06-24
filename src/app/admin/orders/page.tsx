import { getOrders } from "@/actions/admin/orders";

import { OrdersClient } from "./_components/orders-client";

type Props = {
  searchParams: Promise<{ status?: string; search?: string }>;
};

export default async function AdminOrdersPage({ searchParams }: Props) {
  const { status = "", search = "" } = await searchParams;
  const orders = await getOrders(status, search);

  return <OrdersClient orders={orders} status={status} search={search} />;
}
