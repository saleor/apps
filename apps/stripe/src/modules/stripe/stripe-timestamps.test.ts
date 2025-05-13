import Stripe from "stripe";
import { describe, expect, it } from "vitest";

import {
  createTimestampFromPaymentIntent,
  createTimestampFromStripeEvent,
} from "@/modules/stripe/stripe-timestamps";

describe("createTimestampFromStripeEvent", () => {
  it("Parses date from SECONDS that are returned from Stripe", () => {
    const theDate = new Date("2023-10-10T00:00:00Z");

    const event = {
      created: theDate.getTime() / 1000,
    } as unknown as Stripe.Event;

    const result = createTimestampFromStripeEvent(event);

    expect(result).toStrictEqual(theDate);
  });
});

describe("createTimestampFromPaymentIntent", () => {
  it("Returns date from canceled_at field if PaymentIntent has canceled status", () => {
    const theDate = new Date("2023-10-10T00:00:00Z");

    const paymentIntent = {
      status: "canceled",
      canceled_at: theDate.getTime() / 1000,
    } as Stripe.PaymentIntent;

    const result = createTimestampFromPaymentIntent(paymentIntent);

    expect(result).toStrictEqual(theDate);
  });

  it("Returns null if PaymentIntent has not canceled status", () => {
    const paymentIntent = {
      status: "succeeded",
      canceled_at: null,
    } as Stripe.PaymentIntent;

    const result = createTimestampFromPaymentIntent(paymentIntent);

    expect(result).toBeNull();
  });
});
