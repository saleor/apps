import { describe, expect, it } from "vitest";

import { BaseError } from "@/lib/errors";

import {
  StripeWebhookNonRetryableErrorResponse,
  StripeWebhookRetryableErrorResponse,
  StripeWebhookSuccessResponse,
} from "./stripe-webhook-response";

describe("StripeWebhookSuccessResponse", () => {
  it("Returns response with status 200 and fixed message to Stripe", async () => {
    const response = new StripeWebhookSuccessResponse().getResponse();

    expect(response.status).toBe(200);
    await expect(response.text()).resolves.toMatchInlineSnapshot(`"Ok"`);
  });
});

describe("StripeWebhookRetryableErrorResponse", () => {
  it("Returns response with status 500 and fixed message to Stripe", async () => {
    const response = new StripeWebhookRetryableErrorResponse(
      new BaseError("Inner reason"),
    ).getResponse();

    expect(response.status).toBe(500);
    await expect(response.text()).resolves.toMatchInlineSnapshot(`"Server error"`);
  });
});

describe("StripeWebhookNonRetryableErrorResponse", () => {
  it("Returns response with status 400 and fixed message to Stripe", async () => {
    const response = new StripeWebhookNonRetryableErrorResponse().getResponse();

    expect(response.status).toBe(400);
    await expect(response.text()).resolves.toMatchInlineSnapshot(`"Malformed request"`);
  });
});
