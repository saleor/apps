import { describe, expect, it } from "vitest";

import {
  StripeWebhookErrorResponse,
  StripeWebhookSuccessResponse,
} from "@/app/api/stripe/webhook/stripe-webhook-response";
import { BaseError } from "@/lib/errors";

describe("StripeWebhookSuccessResponse", () => {
  it("Returns response with status 200 and fixed message to Stripe", async () => {
    const response = new StripeWebhookSuccessResponse().getResponse();

    expect(response.status).toBe(200);
    await expect(response.text()).resolves.toMatchInlineSnapshot(`"OK"`);
  });
});

describe("StripeWebhookErrorResponse", () => {
  it("Returns response with status 200 and fixed message to Stripe", async () => {
    const response = new StripeWebhookErrorResponse(new BaseError("Inner reason")).getResponse();

    expect(response.status).toBe(500);
    await expect(response.text()).resolves.toMatchInlineSnapshot(`"Error"`);
  });
});
