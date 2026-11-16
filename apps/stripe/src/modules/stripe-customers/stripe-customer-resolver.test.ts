import { err, ok } from "neverthrow";
import Stripe from "stripe";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { mockedConfigurationId, mockedSaleorAppId } from "@/__tests__/mocks/constants";
import { mockedStripeCustomerLinkRepo } from "@/__tests__/mocks/mocked-stripe-customer-link-repo";
import { mockedStripeCustomersApi } from "@/__tests__/mocks/mocked-stripe-customers-api";
import { mockedSaleorApiUrl } from "@/__tests__/mocks/saleor-api-url";
import { type StripeCustomerSourceFragment } from "@/generated/graphql";
import { createStripeCustomerId } from "@/modules/stripe/stripe-customer-id";
import { StripeCustomerLinkRepoError } from "@/modules/stripe-customers/repositories/stripe-customer-link-repo";

import {
  isMissingStripeCustomerError,
  StripeCustomerResolver,
  StripeCustomerResolverError,
} from "./stripe-customer-resolver";

vi.mock("@/lib/logger", () => ({
  createLogger: () => ({ error: vi.fn(), warn: vi.fn(), info: vi.fn(), debug: vi.fn() }),
}));

const guestSource: StripeCustomerSourceFragment = {
  __typename: "Checkout",
  email: "guest@example.com",
  user: null,
  billingAddress: null,
  shippingAddress: null,
};

const signedInSource: StripeCustomerSourceFragment = {
  ...guestSource,
  user: { id: "user-1", email: "user@example.com", firstName: "Ada", lastName: "Lovelace" },
};

const link = {
  saleorApiUrl: mockedSaleorApiUrl,
  appId: mockedSaleorAppId,
  configId: mockedConfigurationId,
  saleorUserId: "user-1",
};

const resolve = (source: StripeCustomerSourceFragment) =>
  new StripeCustomerResolver({ linkRepo: mockedStripeCustomerLinkRepo }).resolve({
    source,
    customersApi: mockedStripeCustomersApi,
    saleorApiUrl: mockedSaleorApiUrl,
    appId: mockedSaleorAppId,
    configId: mockedConfigurationId,
    idempotencyKey: "idempotency-key",
  });

const permissionError = () =>
  new Stripe.errors.StripePermissionError({
    message: "missing permission",
    type: "invalid_request_error",
  });

describe("StripeCustomerResolver", () => {
  beforeEach(() => {
    vi.mocked(mockedStripeCustomersApi.createCustomer).mockResolvedValue(
      ok({ id: "cus_new" } as Stripe.Customer),
    );
    vi.mocked(mockedStripeCustomerLinkRepo.getCustomerId).mockResolvedValue(ok(null));
  });

  it("Returns no Customer for a guest, without calling Stripe or the link store", async () => {
    const result = await resolve(guestSource);

    expect(result._unsafeUnwrap()).toBeNull();
    expect(mockedStripeCustomersApi.createCustomer).not.toHaveBeenCalled();
    expect(mockedStripeCustomerLinkRepo.getCustomerId).not.toHaveBeenCalled();
  });

  it("Reuses the Customer linked to a signed-in user", async () => {
    vi.mocked(mockedStripeCustomerLinkRepo.getCustomerId).mockResolvedValue(
      ok(createStripeCustomerId("cus_linked")),
    );

    const result = await resolve(signedInSource);

    expect(result._unsafeUnwrap()).toStrictEqual({
      customerId: "cus_linked",
      paymentShipping: undefined,
      link,
    });
    expect(mockedStripeCustomerLinkRepo.getCustomerId).toHaveBeenCalledWith(link);
    expect(mockedStripeCustomersApi.createCustomer).not.toHaveBeenCalled();
  });

  it("Creates and links a Customer on a signed-in user's first payment", async () => {
    vi.mocked(mockedStripeCustomerLinkRepo.getCustomerId).mockResolvedValue(ok(null));
    vi.mocked(mockedStripeCustomerLinkRepo.saveCustomerId).mockImplementation(async (_, id) =>
      ok(id),
    );

    const result = await resolve(signedInSource);

    expect(result._unsafeUnwrap()?.customerId).toBe("cus_new");
    expect(mockedStripeCustomersApi.createCustomer).toHaveBeenCalledWith(
      expect.objectContaining({
        metadata: { saleor_api_url: mockedSaleorApiUrl, saleor_user_id: "user-1" },
      }),
    );
    expect(mockedStripeCustomerLinkRepo.saveCustomerId).toHaveBeenCalledWith(link, "cus_new");
  });

  it("Uses the Customer another payment linked first", async () => {
    vi.mocked(mockedStripeCustomerLinkRepo.getCustomerId).mockResolvedValue(ok(null));
    vi.mocked(mockedStripeCustomerLinkRepo.saveCustomerId).mockResolvedValue(
      ok(createStripeCustomerId("cus_first")),
    );

    const result = await resolve(signedInSource);

    expect(result._unsafeUnwrap()?.customerId).toBe("cus_first");
  });

  it("Still uses the created Customer when the link can't be saved", async () => {
    vi.mocked(mockedStripeCustomerLinkRepo.getCustomerId).mockResolvedValue(ok(null));
    vi.mocked(mockedStripeCustomerLinkRepo.saveCustomerId).mockResolvedValue(
      err(new StripeCustomerLinkRepoError("dynamo down")),
    );

    const result = await resolve(signedInSource);

    expect(result._unsafeUnwrap()?.customerId).toBe("cus_new");
  });

  it("Returns Failed when the link can't be read", async () => {
    vi.mocked(mockedStripeCustomerLinkRepo.getCustomerId).mockResolvedValue(
      err(new StripeCustomerLinkRepoError("dynamo down")),
    );

    const result = await resolve(signedInSource);

    expect(result._unsafeUnwrapErr()).toBeInstanceOf(StripeCustomerResolverError.Failed);
    expect(mockedStripeCustomersApi.createCustomer).not.toHaveBeenCalled();
  });

  it("Returns PermissionDenied when the key can't create Customers", async () => {
    vi.mocked(mockedStripeCustomersApi.createCustomer).mockResolvedValue(err(permissionError()));

    const result = await resolve(signedInSource);

    expect(result._unsafeUnwrapErr()).toBeInstanceOf(StripeCustomerResolverError.PermissionDenied);
  });

  it("Returns Failed on other Stripe errors", async () => {
    vi.mocked(mockedStripeCustomersApi.createCustomer).mockResolvedValue(
      err(new Stripe.errors.StripeAPIError({ message: "boom", type: "api_error" })),
    );

    const result = await resolve(signedInSource);

    expect(result._unsafeUnwrapErr()).toBeInstanceOf(StripeCustomerResolverError.Failed);
  });
});

describe("isMissingStripeCustomerError", () => {
  it("Detects a deleted Customer", () => {
    const error = new Stripe.errors.StripeInvalidRequestError({
      message: "No such customer",
      type: "invalid_request_error",
      code: "resource_missing",
      param: "customer",
    });

    expect(isMissingStripeCustomerError(error)).toBe(true);
  });

  it("Ignores other missing resources", () => {
    const error = new Stripe.errors.StripeInvalidRequestError({
      message: "No such payment method",
      type: "invalid_request_error",
      code: "resource_missing",
      param: "payment_method",
    });

    expect(isMissingStripeCustomerError(error)).toBe(false);
  });
});
