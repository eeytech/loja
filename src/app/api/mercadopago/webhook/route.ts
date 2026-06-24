import { eq } from "drizzle-orm";
import { MercadoPagoConfig, Payment } from "mercadopago";
import { NextResponse } from "next/server";

import { db } from "@/db";
import { orderTable } from "@/db/schema";

export const POST = async (request: Request) => {
  if (!process.env.MERCADOPAGO_ACCESS_TOKEN) {
    return NextResponse.error();
  }

  const body = await request.json();

  // O MP envia notificações para vários tipos de eventos; só nos interessa "payment"
  if (body.type !== "payment") {
    return NextResponse.json({ received: true });
  }

  const paymentId = body.data?.id;
  if (!paymentId) {
    return NextResponse.error();
  }

  const client = new MercadoPagoConfig({
    accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN,
  });
  const paymentApi = new Payment(client);
  const payment = await paymentApi.get({ id: paymentId });

  if (payment.status === "approved") {
    const orderId = payment.external_reference;
    if (!orderId) {
      return NextResponse.error();
    }
    await db
      .update(orderTable)
      .set({ status: "paid" })
      .where(eq(orderTable.id, orderId));
  }

  return NextResponse.json({ received: true });
};
