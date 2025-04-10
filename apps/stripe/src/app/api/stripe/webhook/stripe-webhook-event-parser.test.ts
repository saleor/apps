import { err, ok } from "neverthrow";
import Stripe from "stripe";
import { describe, expect, it } from "vitest";

import { mockStripeWebhookSecret } from "@/__tests__/mocks/stripe-webhook-secret";
import { StripeWebhookEventParser } from "@/app/api/stripe/webhook/stripe-webhook-event-parser";
import { StripeEventParsingError } from "@/modules/stripe/types";

describe("StripeWebhookEventParser", () => {
  it("Creates", () => {
    expect(new StripeWebhookEventParser()).toBeInstanceOf(StripeWebhookEventParser);
  });

  /**
   * TODO https://github.com/stripe/stripe-node#testing-webhook-signing can be used in test with real RK
   */
  it("Returns valid event if properly signed - verified by signatureValidator", () => {
    const instance = new StripeWebhookEventParser();

    const result = instance.verifyRequestAndGetEvent({
      rawBody: JSON.stringify({ foo: "bar" }),
      webhookSecret: mockStripeWebhookSecret,
      signatureHeader: "TEST_SIGN",
      signatureValidator: {
        verifySignature() {
          const event = { id: "AAA" } as Stripe.Event;

          return ok(event);
        },
      },
    });

    expect(result._unsafeUnwrap()).toMatchInlineSnapshot(`
      {
        "id": "AAA",
      }
    `);
  });

  it("Returns InvalidSignatureError if signatureValidator fails to verify signature", () => {
    const instance = new StripeWebhookEventParser();

    const result = instance.verifyRequestAndGetEvent({
      rawBody: JSON.stringify({ foo: "bar" }),
      webhookSecret: mockStripeWebhookSecret,
      signatureHeader: "TEST_SIGN",
      signatureValidator: {
        verifySignature() {
          return err(new StripeEventParsingError("Failing because its a test"));
        },
      },
    });

    expect(result._unsafeUnwrapErr()).toMatchInlineSnapshot(`
      [InvalidSignatureError: StripeEventParsingError: Failing because its a test
      Failed to extract Event from Stripe webhook]
    `);
  });
});
