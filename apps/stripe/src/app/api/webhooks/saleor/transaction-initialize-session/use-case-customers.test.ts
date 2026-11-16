import { err, ok } from "neverthrow";
import Stripe from "stripe";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { mockedAppConfigRepo } from "@/__tests__/mocks/app-config-repo";
import {
  mockedConfigurationId,
  mockedSaleorAppId,
  mockedSaleorSchemaVersionSupportingPaymentMethodDetails,
} from "@/__tests__/mocks/constants";
import { mockedStripeConfig } from "@/__tests__/mocks/mock-stripe-config";
import { mockStripeProblemReporter } from "@/__tests__/mocks/mock-stripe-problem-reporter";
import { mockedStripeCustomerLinkRepo } from "@/__tests__/mocks/mocked-stripe-customer-link-repo";
import { mockedStripeCustomersApi } from "@/__tests__/mocks/mocked-stripe-customers-api";
import { mockedStripePaymentIntentsApi } from "@/__tests__/mocks/mocked-stripe-payment-intents-api";
import { MockedTransactionRecorder } from "@/__tests__/mocks/mocked-transaction-recorder";
import { mockedSaleorApiUrl } from "@/__tests__/mocks/saleor-api-url";
import { getMockedTransactionInitializeSessionEvent } from "@/__tests__/mocks/saleor-events/transaction-initialize-session-event";
import { StripeConfig } from "@/modules/app-config/domain/stripe-config";
import { createStripeCustomerId } from "@/modules/stripe/stripe-customer-id";
import { StripeCustomerResolver } from "@/modules/stripe-customers/stripe-customer-resolver";

import { TransactionInitializeSessionUseCase } from "./use-case";
import { TransactionInitializeSessionUseCaseResponses } from "./use-case-response";

vi.mock("@saleor/app-problems", () => ({
  AppProblemsReporter: class {
    reportProblem() {
      return Promise.resolve({ isErr: () => false });
    }
    clearProblems() {
      return Promise.resolve({ isErr: () => false });
    }
  },
}));

vi.mock("@/lib/logger", () => ({
  createLogger: () => ({ error: vi.fn(), warn: vi.fn(), info: vi.fn(), debug: vi.fn() }),
}));

const configWithCustomers = StripeConfig.create({
  id: mockedStripeConfig.id,
  name: mockedStripeConfig.name,
  publishableKey: mockedStripeConfig.publishableKey,
  restrictedKey: mockedStripeConfig.restrictedKey,
  webhookSecret: mockedStripeConfig.webhookSecret,
  webhookId: mockedStripeConfig.webhookId,
  customerCreationEnabled: true,
})._unsafeUnwrap();

const signedInEvent = () => {
  const event = getMockedTransactionInitializeSessionEvent();

  return {
    ...event,
    sourceObject: {
      ...event.sourceObject,
      email: "buyer@example.com",
      user: { id: "user-1", email: "buyer@example.com", firstName: "Ada", lastName: "Lovelace" },
      billingAddress: null,
      shippingAddress: null,
    },
  };
};

const paymentIntent = {
  amount: 100,
  currency: "usd",
  client_secret: "secret-value",
  id: "pi_test",
  status: "requires_payment_method",
} as Stripe.PaymentIntent;

const execute = (event = signedInEvent()) =>
  new TransactionInitializeSessionUseCase({
    appConfigRepo: mockedAppConfigRepo,
    stripePaymentIntentsApiFactory: { create: () => mockedStripePaymentIntentsApi },
    transactionRecorder: new MockedTransactionRecorder(),
    stripeCustomersApiFactory: { create: () => mockedStripeCustomersApi },
    stripeCustomerResolver: new StripeCustomerResolver({ linkRepo: mockedStripeCustomerLinkRepo }),
  }).execute({
    saleorApiUrl: mockedSaleorApiUrl,
    appId: mockedSaleorAppId,
    event,
    saleorSchemaVersion: mockedSaleorSchemaVersionSupportingPaymentMethodDetails,
    problemReporter: mockStripeProblemReporter,
  });

describe("TransactionInitializeSessionUseCase - Stripe Customers", () => {
  beforeEach(() => {
    vi.mocked(mockedStripePaymentIntentsApi.createPaymentIntent).mockResolvedValue(
      ok(paymentIntent),
    );
  });

  it("Doesn't touch Customers when customer creation is off", async () => {
    await execute();

    expect(mockedStripeCustomersApi.createCustomer).not.toHaveBeenCalled();
    expect(mockedStripeCustomerLinkRepo.getCustomerId).not.toHaveBeenCalled();
    expect(
      vi.mocked(mockedStripePaymentIntentsApi.createPaymentIntent).mock.calls[0][0].intentParams,
    ).not.toHaveProperty("customer");
  });

  describe("when customer creation is on", () => {
    beforeEach(() => {
      vi.mocked(mockedAppConfigRepo.getStripeConfig).mockResolvedValue(ok(configWithCustomers));
    });

    it("Attaches the linked Customer to the Payment Intent", async () => {
      vi.mocked(mockedStripeCustomerLinkRepo.getCustomerId).mockResolvedValue(
        ok(createStripeCustomerId("cus_linked")),
      );

      const result = await execute();

      expect(result._unsafeUnwrap()).toBeInstanceOf(
        TransactionInitializeSessionUseCaseResponses.Success,
      );
      expect(mockedStripePaymentIntentsApi.createPaymentIntent).toHaveBeenCalledWith(
        expect.objectContaining({
          intentParams: expect.objectContaining({ customer: "cus_linked", shipping: undefined }),
        }),
      );
    });

    it("Turns customer creation off and reports a problem when the key lacks the permission", async () => {
      vi.mocked(mockedStripeCustomerLinkRepo.getCustomerId).mockResolvedValue(ok(null));
      vi.mocked(mockedStripeCustomersApi.createCustomer).mockResolvedValue(
        err(
          new Stripe.errors.StripePermissionError({
            message: "missing permission",
            type: "invalid_request_error",
          }),
        ),
      );
      vi.mocked(mockedAppConfigRepo.disableCustomerCreation).mockResolvedValue(ok(null));
      const reportSpy = vi
        .spyOn(mockStripeProblemReporter, "reportCustomerCreationDisabled")
        .mockResolvedValue();

      const result = await execute();

      expect(result._unsafeUnwrap()).toBeInstanceOf(
        TransactionInitializeSessionUseCaseResponses.Success,
      );
      expect(
        vi.mocked(mockedStripePaymentIntentsApi.createPaymentIntent).mock.calls[0][0].intentParams,
      ).not.toHaveProperty("customer");

      await vi.waitFor(() => {
        expect(mockedAppConfigRepo.disableCustomerCreation).toHaveBeenCalledWith({
          saleorApiUrl: mockedSaleorApiUrl,
          appId: mockedSaleorAppId,
          configId: mockedConfigurationId,
        });
        expect(reportSpy).toHaveBeenCalledWith(mockedConfigurationId, "config-name");
      });
    });

    it("Creates the Payment Intent without a Customer when resolving it fails", async () => {
      vi.mocked(mockedStripeCustomerLinkRepo.getCustomerId).mockResolvedValue(ok(null));
      vi.mocked(mockedStripeCustomersApi.createCustomer).mockResolvedValue(
        err(new Stripe.errors.StripeAPIError({ message: "boom", type: "api_error" })),
      );

      const result = await execute();

      expect(result._unsafeUnwrap()).toBeInstanceOf(
        TransactionInitializeSessionUseCaseResponses.Success,
      );
      expect(mockedAppConfigRepo.disableCustomerCreation).not.toHaveBeenCalled();
    });

    it("Drops the link and retries without a Customer when the linked one was deleted in Stripe", async () => {
      vi.mocked(mockedStripeCustomerLinkRepo.getCustomerId).mockResolvedValue(
        ok(createStripeCustomerId("cus_deleted")),
      );
      vi.mocked(mockedStripeCustomerLinkRepo.deleteCustomerId).mockResolvedValue(ok(null));
      vi.mocked(mockedStripePaymentIntentsApi.createPaymentIntent).mockResolvedValueOnce(
        err(
          new Stripe.errors.StripeInvalidRequestError({
            message: "No such customer",
            type: "invalid_request_error",
            code: "resource_missing",
            param: "customer",
          }),
        ),
      );

      const result = await execute();

      expect(result._unsafeUnwrap()).toBeInstanceOf(
        TransactionInitializeSessionUseCaseResponses.Success,
      );
      expect(mockedStripeCustomerLinkRepo.deleteCustomerId).toHaveBeenCalledWith({
        saleorApiUrl: mockedSaleorApiUrl,
        appId: mockedSaleorAppId,
        configId: mockedConfigurationId,
        saleorUserId: "user-1",
      });

      const retry = vi.mocked(mockedStripePaymentIntentsApi.createPaymentIntent).mock.calls[1][0];

      expect(retry.intentParams).not.toHaveProperty("customer");
      expect(retry.idempotencyKey).toBe("idempotency-key:without-customer");
    });
  });
});
