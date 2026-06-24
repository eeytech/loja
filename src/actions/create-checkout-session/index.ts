"use server";

import { eq } from "drizzle-orm";
import { MercadoPagoConfig, Preference } from "mercadopago";

import { db } from "@/db";
import { orderItemTable, orderTable } from "@/db/schema";
import { getSession } from "@/lib/session";

import {
  CreateCheckoutSessionSchema,
  createCheckoutSessionSchema,
} from "./schema";

export const createCheckoutSession = async (
  data: CreateCheckoutSessionSchema,
) => {
  if (!process.env.MERCADOPAGO_ACCESS_TOKEN) {
    throw new Error("Mercado Pago access token is not set");
  }
  const session = await getSession();
  if (!session?.user) {
    throw new Error("Unauthorized");
  }
  const { orderId } = createCheckoutSessionSchema.parse(data);
  const order = await db.query.orderTable.findFirst({
    where: eq(orderTable.id, orderId),
  });
  if (!order) {
    throw new Error("Order not found");
  }
  if (order.userId !== session.user.id) {
    throw new Error("Unauthorized");
  }
  const orderItems = await db.query.orderItemTable.findMany({
    where: eq(orderItemTable.orderId, orderId),
    with: {
      productVariant: { with: { product: true } },
    },
  });
  const client = new MercadoPagoConfig({
    accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN,
  });
  const preference = new Preference(client);
  const response = await preference.create({
    body: {
      items: orderItems.map((orderItem) => ({
        id: orderItem.productVariant.id,
        title: `${orderItem.productVariant.product.name} - ${orderItem.productVariant.name}`,
        description: orderItem.productVariant.product.description ?? undefined,
        picture_url: orderItem.productVariant.imageUrl,
        quantity: orderItem.quantity,
        // Mercado Pago espera valores em reais (float), não em centavos
        unit_price: orderItem.priceInCents / 100,
        currency_id: "BRL",
      })),
      back_urls: {
        success: `${process.env.NEXT_PUBLIC_APP_URL}/checkout/success`,
        pending: `${process.env.NEXT_PUBLIC_APP_URL}/checkout/pending`,
        failure: `${process.env.NEXT_PUBLIC_APP_URL}/checkout/cancel`,
      },
      auto_return: "approved",
      // external_reference é o campo canônico do MP para referenciar pedidos externos
      external_reference: orderId,
    },
  });
  return {
    preferenceId: response.id,
    initPoint: response.init_point,
  };
};
