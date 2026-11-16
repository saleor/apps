"use client";

import { type ComponentProps, useEffect, useState } from "react";

import { FormButton } from "@/components/form-button";
import { Input } from "@/components/ui/input";
import { toast } from "@/components/ui/use-toast";
import { TotalPriceFragment } from "@/graphql/fragments";
import { readFragment } from "@/graphql/gql";
import { actAsCustomer } from "@/modules/customer-session/components/act-as-customer";
import {
  type CustomerSession,
  resolveCustomerSession,
} from "@/modules/customer-session/components/storage-helpers";

import { getCheckoutTotalPrice } from "../actions/get-checkout-total-price";
import { SquarePaymentForm } from "./square-payment-form";

export const SquareCheckout = (props: ComponentProps<typeof SquarePaymentForm>) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [ready, setReady] = useState(false);
  const [paymentContext, setPaymentContext] = useState({
    totalPrice: props.totalPrice,
    checkoutContact: props.checkoutContact,
  });
  const [savedSession, setSavedSession] = useState<CustomerSession | null>(null);

  useEffect(() => setSavedSession(resolveCustomerSession(props.envUrl)), [props.envUrl]);

  const login = async (existingSession?: CustomerSession) => {
    setBusy(true);
    try {
      await actAsCustomer({
        envUrl: props.envUrl,
        checkoutId: props.checkoutId,
        credentials: { email, password },
        session: existingSession,
      });
      const refreshed = await getCheckoutTotalPrice({
        envUrl: props.envUrl,
        checkoutId: props.checkoutId,
      });
      const checkout = refreshed?.data?.checkout;
      const totalPrice = readFragment(TotalPriceFragment, checkout?.totalPrice);

      if (!checkout || !totalPrice)
        throw new Error("Could not refresh the checkout after customer login.");
      setPaymentContext({
        totalPrice,
        checkoutContact: { email: checkout.email, billingAddress: checkout.billingAddress },
      });
      setPassword("");
      setReady(true);
    } catch (error) {
      toast({
        title: "Customer login failed",
        description: error instanceof Error ? error.message : "Please try again.",
        variant: "destructive",
      });
    } finally {
      setBusy(false);
    }
  };

  if (ready || !props.squareConfig.methods.includes("saved-card"))
    return <SquarePaymentForm {...props} {...paymentContext} />;

  return (
    <section className="mx-auto grid max-w-3xl gap-4 px-4 py-6">
      <h2 className="text-2xl font-bold">Square Online</h2>
      <p className="text-sm text-muted-foreground">
        Continue to payment, or attach a test customer to use saved cards.
      </p>
      <FormButton disabled={busy} onClick={() => setReady(true)}>
        Continue to payment
      </FormButton>
      {savedSession ? (
        <FormButton variant="secondary" loading={busy} onClick={() => void login(savedSession)}>
          Continue as {savedSession.email}
        </FormButton>
      ) : null}
      <details className="rounded-md border p-4">
        <summary className="cursor-pointer font-medium">
          Log in to test saved cards (optional)
        </summary>
        <form
          className="mt-4 grid gap-3 sm:grid-cols-2"
          onSubmit={(event) => {
            event.preventDefault();
            void login();
          }}
        >
          <label className="grid gap-2">
            Email
            <Input
              type="email"
              autoComplete="username"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />
          </label>
          <label className="grid gap-2">
            Password
            <Input
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />
          </label>
          <FormButton className="sm:col-span-2 sm:justify-self-end" loading={busy}>
            Log in
          </FormButton>
        </form>
      </details>
    </section>
  );
};
