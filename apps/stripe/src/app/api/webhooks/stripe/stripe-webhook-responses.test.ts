import { describe, expect, it } from "vitest";

import {
  StripeWebhookAppIsNotConfiguredResponse,
  StripeWebhookMalformedRequestResponse,
  StripeWebhookSeverErrorResponse,
  StripeWebhookSuccessResponse,
  StripeWebhookUnrecognizedEventResponse,
} from "./stripe-webhook-responses";

describe("StripeWebhookSuccessResponse", () => {
  it("Returns response with status 200 and fixed message to Stripe", async () => {
    const response = new StripeWebhookSuccessResponse().getResponse();

    expect(response.status).toBe(200);
    await expect(response.text()).resolves.toMatchInlineSnapshot(`"Ok"`);
  });
});

describe("StripeWebhookMalformedRequestResponse", () => {
  it("Returns response with status 400 and fixed message to Stripe", async () => {
    const response = new StripeWebhookMalformedRequestResponse().getResponse();

    expect(response.status).toBe(400);
    await expect(response.text()).resolves.toMatchInlineSnapshot(`"Malformed request"`);
  });
});

describe("StripeWebhookAppIsNotConfiguredResponse", () => {
  it("Returns response with status 400 and fixed message to Stripe", async () => {
    const response = new StripeWebhookAppIsNotConfiguredResponse().getResponse();

    expect(response.status).toBe(400);
    await expect(response.text()).resolves.toMatchInlineSnapshot(`"App is not configured"`);
  });
});

describe("StripeWebhookSeverErrorResponse", () => {
  it("Returns response with status 500 and fixed message to Stripe", async () => {
    const response = new StripeWebhookSeverErrorResponse().getResponse();

    expect(response.status).toBe(500);
    await expect(response.text()).resolves.toMatchInlineSnapshot(`"Server error"`);
  });
});

describe("StripeWebhookUnrecognizedEventResponse", () => {
  it("Returns response with status 200 for unrecognized events to prevent webhook disabling", async () => {
    const response = new StripeWebhookUnrecognizedEventResponse().getResponse();

    expect(response.status).toBe(200);
    await expect(response.text()).resolves.toMatchInlineSnapshot(
      `"Event from unrecognized connected account - ignored"`,
    );
  });
});
