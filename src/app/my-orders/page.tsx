import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";

import { Header } from "@/components/common/header";
import { db } from "@/db";
import { orderTable } from "@/db/schema";
import { getSession } from "@/lib/session";

import Orders from "./components/orders";

const MyOrdersPage = async () => {
  const session = await getSession();
  if (!session?.user.id) {
    redirect("/login");
  }
  const orders = await db.query.orderTable.findMany({
    where: eq(orderTable.userId, session?.user.id),
    with: {
      items: {
        with: {
          productVariant: {
            with: {
              product: true,
            },
          },
        },
      },
    },
  });

  return (
    <>
      <Header />
      <div className="px-5">
        <Orders
          orders={orders.map((order) => ({
            id: order.id,
            totalPriceInCents: order.totalPriceInCents,
            status: order.status,
            createdAt: order.createdAt,
            items: order.items.map((item) => ({
              id: item.id,
              imageUrl: item.productVariant.imageUrl,
              productName: item.productVariant.product.name,
              productVariantName: item.productVariant.name,
              priceInCents: item.productVariant.priceInCents,
              quantity: item.quantity,
            })),
          }))}
        />
      </div>
    </>
  );
};

export default MyOrdersPage;
