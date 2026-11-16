import Stripe from "stripe";
import { describe, expect, it, vi } from "vitest";

import { mockedStripeRestrictedKey } from "@/__tests__/mocks/mocked-stripe-restricted-key";
import { StripeClient } from "@/modules/stripe/stripe-client";

import { StripeCustomersApi } from "./stripe-customers-api";

const setup = () => {
  const clientWrapper = StripeClient.createFromRestrictedKey(mockedStripeRestrictedKey);

  return { clientWrapper, instance: StripeCustomersApi.createFromClient(clientWrapper) };
};

describe("StripeCustomersApi", () => {
  it("Creates a Customer with params, metadata and idempotency key", async () => {
    const { clientWrapper, instance } = setup();

    vi.spyOn(clientWrapper.nativeClient.customers, "create").mockResolvedValue(
      // @ts-expect-error - in this test we dont care about the response
      {},
    );

    await instance.createCustomer({
      params: { email: "buyer@example.com", name: "Ada Lovelace" },
      metadata: { saleor_api_url: "https://example.com/graphql/", saleor_user_id: "user-1" },
      idempotencyKey: "IK:customer",
    });

    expect(clientWrapper.nativeClient.customers.create).toHaveBeenCalledExactlyOnceWith(
      {
        email: "buyer@example.com",
        name: "Ada Lovelace",
        metadata: { saleor_api_url: "https://example.com/graphql/", saleor_user_id: "user-1" },
      },
      { idempotencyKey: "IK:customer" },
    );
  });

  describe("hasCustomersWritePermission", () => {
    it("Returns true when Stripe looks the probe Customer up (resource missing)", async () => {
      const { clientWrapper, instance } = setup();

      vi.spyOn(clientWrapper.nativeClient.customers, "update").mockRejectedValue(
        new Stripe.errors.StripeInvalidRequestError({
          message: "No such customer",
          type: "invalid_request_error",
          code: "resource_missing",
        }),
      );

      expect((await instance.hasCustomersWritePermission())._unsafeUnwrap()).toBe(true);
    });

    it("Returns false when the key lacks the permission", async () => {
      const { clientWrapper, instance } = setup();

      vi.spyOn(clientWrapper.nativeClient.customers, "update").mockRejectedValue(
        new Stripe.errors.StripePermissionError({
          message: "The provided key does not have the required permissions",
          type: "invalid_request_error",
        }),
      );

      expect((await instance.hasCustomersWritePermission())._unsafeUnwrap()).toBe(false);
    });

    it("Returns an error when Stripe can't answer", async () => {
      const { clientWrapper, instance } = setup();

      vi.spyOn(clientWrapper.nativeClient.customers, "update").mockRejectedValue(
        new Stripe.errors.StripeConnectionError({ message: "offline", type: "api_error" }),
      );

      expect((await instance.hasCustomersWritePermission()).isErr()).toBe(true);
    });
  });
});
