"use server";

import { redirect } from "next/navigation";

import { createPath } from "@/lib/utils";

export async function redirectToPaymentGatewaySelect({
  checkoutId = "",
}: {
  checkoutId: string | undefined;
}) {
  redirect(createPath(checkoutId, "payment-gateway"));
}
