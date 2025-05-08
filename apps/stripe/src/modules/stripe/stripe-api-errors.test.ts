import Stripe from "stripe";
import { describe, expect, it } from "vitest";

import {
  mapStripeErrorToApiError,
  StripeAPIError,
  StripeAuthenticationError,
  StripeCardError,
  StripeConnectionError,
  StripeIdempotencyError,
  StripeInvalidRequestError,
  StripePermissionError,
  StripeRateLimitError,
  StripeUnknownAPIError,
} from "./stripe-api-errors";

describe("mapStripeCreatePaymentIntentErrorToApiError", () => {
  it("maps Stripe.errors.StripeCardError to app StripeCardError", () => {
    const stripeError = new Stripe.errors.StripeCardError({
      message: "Card declined",
      type: "card_error",
      code: "card_declined",
    });

    const result = mapStripeErrorToApiError(stripeError);

    expect(result).toBeInstanceOf(StripeCardError);
  });

  it("maps Stripe.errors.StripeInvalidRequestError to StripeInvalidRequestError", () => {
    const stripeError = new Stripe.errors.StripeInvalidRequestError({
      message: "Missing required param",
      type: "invalid_request_error",
      param: "amount",
      code: "param_required",
    });

    const result = mapStripeErrorToApiError(stripeError);

    expect(result).toBeInstanceOf(StripeInvalidRequestError);
  });

  it("maps Stripe.errors.StripeRateLimitError to StripeRateLimitError", () => {
    const stripeError = new Stripe.errors.StripeRateLimitError({
      message: "Too many requests",
      type: "rate_limit_error",
    });

    const result = mapStripeErrorToApiError(stripeError);

    expect(result).toBeInstanceOf(StripeRateLimitError);
  });

  it("maps Stripe.errors.StripeConnectionError to StripeConnectionError", () => {
    const stripeError = new Stripe.errors.StripeConnectionError({
      message: "Connection failed",
      type: "api_error",
    });

    const result = mapStripeErrorToApiError(stripeError);

    expect(result).toBeInstanceOf(StripeConnectionError);
    expect(result.message).toBe("There was a network problem between app and Stripe");
  });

  it("maps Stripe.errors.StripeAPIError to StripeAPIError", () => {
    const stripeError = new Stripe.errors.StripeAPIError({
      message: "API error",
      type: "api_error",
    });

    const result = mapStripeErrorToApiError(stripeError);

    expect(result).toBeInstanceOf(StripeAPIError);
  });

  it("maps Stripe.errors.StripeAuthenticationError to StripeAuthenticationError", () => {
    const stripeError = new Stripe.errors.StripeAuthenticationError({
      message: "Auth error",
      type: "authentication_error",
    });

    const result = mapStripeErrorToApiError(stripeError);

    expect(result).toBeInstanceOf(StripeAuthenticationError);
  });

  it("maps Stripe.errors.StripePermissionError to StripePermissionError", () => {
    const stripeError = new Stripe.errors.StripePermissionError({
      message: "Permission error",
      type: "invalid_request_error",
    });

    const result = mapStripeErrorToApiError(stripeError);

    expect(result).toBeInstanceOf(StripePermissionError);
  });

  it("maps Stripe.errors.StripeIdempotencyError to StripeIdempotencyError", () => {
    const stripeError = new Stripe.errors.StripeIdempotencyError({
      message: "Idempotency error",
      type: "idempotency_error",
    });

    const result = mapStripeErrorToApiError(stripeError);

    expect(result).toBeInstanceOf(StripeIdempotencyError);
  });

  it("maps unknown error to StripeUnknownAPIError", () => {
    const unknownError = new Error("Unknown error");

    const result = mapStripeErrorToApiError(unknownError);

    expect(result).toBeInstanceOf(StripeUnknownAPIError);
  });
});
