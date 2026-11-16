"use server";

import { redirect } from "next/navigation";

import { createPath } from "@/lib/utils";

export async function redirectToPaymentGatewaySelect({
  checkoutId = "",
  envUrl,
}: {
  checkoutId: string | undefined;
  envUrl: string;
}) {
  redirect(
    createPath("/env", encodeURIComponent(envUrl), "checkout", checkoutId, "payment-gateway"),
  );
}
