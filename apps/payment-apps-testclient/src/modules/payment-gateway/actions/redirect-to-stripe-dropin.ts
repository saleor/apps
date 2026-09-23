"use server";

import { redirect } from "next/navigation";

import { createPath } from "@/lib/utils";

export async function redirectToStripeDropin({
  paymentGatewayId = "",
}: {
  paymentGatewayId: string;
}) {
  redirect(createPath("payment-gateway", "stripe", paymentGatewayId));
}
