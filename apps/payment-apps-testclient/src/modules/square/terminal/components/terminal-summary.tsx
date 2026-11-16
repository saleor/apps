"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import {
  checkoutPath,
  readTestSession,
  type TerminalState,
} from "@/modules/square/terminal/test-session";

export function TerminalSummary({
  saleorApiUrl,
  checkoutId,
}: {
  saleorApiUrl: string;
  checkoutId: string;
}) {
  const [terminal, setTerminal] = useState<TerminalState | null>(null);

  useEffect(
    () => setTerminal(readTestSession(saleorApiUrl, checkoutId)?.terminal ?? null),
    [saleorApiUrl, checkoutId],
  );

  if (terminal?.status !== "COMPLETED")
    return <p className="p-6">No completed Terminal payment for this checkout.</p>;

  return (
    <main className="mx-auto max-w-3xl px-4 py-6">
      <section className="grid gap-6 rounded-lg border p-6">
        <header>
          <h2>Payment complete</h2>
          <p className="text-sm text-muted-foreground">
            The Terminal app confirmed the payment and reported it to Saleor.
          </p>
        </header>
        <dl className="grid gap-4">
          <div>
            <dt>Checkout</dt>
            <dd>
              <code>{checkoutId}</code>
            </dd>
          </div>
          <div>
            <dt>Terminal checkout</dt>
            <dd>
              <code>{terminal?.terminalCheckoutId ?? "Loading…"}</code>
            </dd>
          </div>
          <div>
            <dt>Saleor transaction</dt>
            <dd>
              <code>{terminal?.saleorTransactionId ?? "Loading…"}</code>
            </dd>
          </div>
        </dl>
        <footer>
          <Button asChild>
            <Link href={checkoutPath(saleorApiUrl, checkoutId, "complete")}>
              Review and complete checkout
            </Link>
          </Button>
        </footer>
      </section>
    </main>
  );
}
