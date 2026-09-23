"use server";

import { redirect } from "next/navigation";

import { createPath } from "@/lib/utils";

export async function redirectToCheckoutDetails({
  envUrl,
  checkoutId = "",
}: {
  envUrl: string;
  checkoutId: string | undefined;
}) {
  redirect(createPath("env", encodeURIComponent(envUrl), "checkout", checkoutId));
}
