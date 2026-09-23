"use server";

import { redirect } from "next/navigation";

import { createPath } from "@/lib/utils";

export async function redirectToAdyenDropin({
  paymentGatewayId = "",
}: {
  paymentGatewayId: string;
}) {
  redirect(createPath("payment-gateway", paymentGatewayId));
}
