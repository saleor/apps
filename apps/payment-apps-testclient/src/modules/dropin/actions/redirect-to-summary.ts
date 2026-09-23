"use server";

import { redirect } from "next/navigation";

import { createPath } from "@/lib/utils";

export async function redirectToCheckoutSummary({
  paymentGatewayId,
}: {
  paymentGatewayId: string;
}) {
  redirect(createPath(paymentGatewayId, "summary"));
}
