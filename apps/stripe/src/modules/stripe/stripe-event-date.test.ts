import Stripe from "stripe";
import { describe, expect, it } from "vitest";

import { createDateFromStripeEvent } from "@/modules/stripe/stripe-event-date";

describe("createDateFromStripeEvent", () => {
  it("Parses date from SECONDS that are returned from Stripe", () => {
    const theDate = new Date("2023-10-10T00:00:00Z");

    const event = {
      created: theDate.getTime() / 1000,
    } as unknown as Stripe.Event;

    const result = createDateFromStripeEvent(event);

    expect(result).toStrictEqual(theDate);
  });
});
