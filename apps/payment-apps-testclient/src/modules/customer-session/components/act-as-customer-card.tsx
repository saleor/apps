"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { FormButton } from "@/components/form-button";
import { Input } from "@/components/ui/input";
import { toast } from "@/components/ui/use-toast";

import { actAsCustomer } from "./act-as-customer";
import {
  type CustomerSession,
  resolveAttachedCheckoutEmail,
  resolveCustomerSession,
  resolveLastCustomerEmail,
} from "./storage-helpers";

/**
 * Attaches the checkout to an existing Saleor customer, so payment apps receive a signed-in buyer
 * instead of a guest. Creating the customer in Saleor is up to the tester.
 */
export const ActAsCustomerCard = ({
  envUrl,
  checkoutId,
}: {
  envUrl: string;
  checkoutId: string;
}) => {
  const router = useRouter();
  const [formOpen, setFormOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [savedSession, setSavedSession] = useState<CustomerSession | null>(null);
  const [attachedEmail, setAttachedEmail] = useState<string | null>(null);

  useEffect(() => {
    setSavedSession(resolveCustomerSession(envUrl));
    setAttachedEmail(resolveAttachedCheckoutEmail(envUrl, checkoutId));
    setEmail(resolveLastCustomerEmail(envUrl));
  }, [envUrl, checkoutId]);

  const act = async (session?: CustomerSession) => {
    setBusy(true);
    try {
      const activeSession = await actAsCustomer({
        envUrl,
        checkoutId,
        credentials: { email, password },
        session,
      });

      setSavedSession(activeSession);
      setAttachedEmail(activeSession.email);
      setPassword("");
      setFormOpen(false);
      toast({ title: `Acting as ${activeSession.email}` });
      router.refresh();
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

  return (
    <div className="grid gap-4 md:col-span-2">
      <h2 className="text-2xl font-bold">Customer</h2>
      {attachedEmail ? (
        <p className="text-sm">
          Acting as <span className="font-medium">{attachedEmail}</span>. Payments for this checkout
          come from a signed-in customer.
        </p>
      ) : (
        <>
          <p className="text-sm text-muted-foreground">
            Checking out as a guest. Log in as an existing Saleor customer to pay as a signed-in
            buyer.
          </p>
          <div className="flex flex-wrap gap-2">
            <FormButton variant="secondary" disabled={busy} onClick={() => setFormOpen(!formOpen)}>
              Act as logged-in customer
            </FormButton>
            {savedSession ? (
              <FormButton variant="outline" loading={busy} onClick={() => void act(savedSession)}>
                Continue as {savedSession.email}
              </FormButton>
            ) : null}
          </div>
        </>
      )}
      {formOpen && !attachedEmail ? (
        <form
          className="grid gap-3 sm:grid-cols-2"
          onSubmit={(event) => {
            event.preventDefault();
            void act();
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
            Log in and attach checkout
          </FormButton>
        </form>
      ) : null}
    </div>
  );
};
