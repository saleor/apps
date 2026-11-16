"use client";

import { attachCheckoutCustomer } from "../actions/attach-checkout-customer";
import { loginCustomer } from "../actions/login-customer";
import { type CustomerSession, saveAttachedCheckout, saveCustomerSession } from "./storage-helpers";

/**
 * Logs in (unless a saved session is passed) and attaches the checkout to that customer, so Saleor
 * sends `checkout.user` to payment apps. Throws with a message fit for a toast.
 */
export const actAsCustomer = async (args: {
  envUrl: string;
  checkoutId: string;
  credentials?: { email: string; password: string };
  session?: CustomerSession;
}) => {
  let session = args.session;

  if (!session) {
    if (!args.credentials) throw new Error("Enter the customer's email and password.");

    const result = await loginCustomer({ envUrl: args.envUrl, ...args.credentials });

    if (!result?.data) throw new Error("Could not log in.");
    if (result.data.status === "error") throw new Error(result.data.error.message);
    session = result.data.session;
  }

  const attached = await attachCheckoutCustomer({
    envUrl: args.envUrl,
    checkoutId: args.checkoutId,
    customerSession: session,
  });

  if (!attached?.data) throw new Error("Could not attach this customer to the checkout.");
  if (attached.data.status === "error") throw new Error(attached.data.error.message);

  const activeSession = attached.data.refreshedSession ?? session;

  saveCustomerSession(args.envUrl, activeSession);
  saveAttachedCheckout({
    envUrl: args.envUrl,
    checkoutId: args.checkoutId,
    email: attached.data.customer.email,
  });

  return activeSession;
};
