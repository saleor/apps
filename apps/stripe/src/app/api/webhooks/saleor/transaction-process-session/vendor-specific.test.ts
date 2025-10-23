import { err, ok } from "neverthrow";
import Stripe from "stripe";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { mockedAppConfigRepo } from "@/__tests__/mocks/app-config-repo";
import {
  mockedSaleorAppId,
  mockedSaleorSchemaVersionSupportingPaymentMethodDetails,
} from "@/__tests__/mocks/constants";
import { mockedStripePaymentIntentId } from "@/__tests__/mocks/mocked-stripe-payment-intent-id";
import { mockedStripePaymentIntentsApi } from "@/__tests__/mocks/mocked-stripe-payment-intents-api";
import { mockedSaleorApiUrl } from "@/__tests__/mocks/saleor-api-url";
import { getMockedTransactionProcessSessionEvent } from "@/__tests__/mocks/saleor-events/transaction-process-session-event";
import {
  mockedTransactionRecorderRepo,
  mockedTransactionRecorderRepoWithVendorAccount,
} from "@/__tests__/mocks/transaction-recorder-repo";
import { createResolvedTransactionFlow } from "@/modules/resolved-transaction-flow";
import { createSaleorTransactionFlow } from "@/modules/saleor/saleor-transaction-flow";
import { createSaleorTransactionId } from "@/modules/saleor/saleor-transaction-id";
import { IStripePaymentIntentsApiFactory } from "@/modules/stripe/types";
import { RecordedTransaction } from "@/modules/transactions-recording/domain/recorded-transaction";

import { TransactionProcessSessionUseCase } from "./use-case";
import { TransactionProcessSessionUseCaseResponses } from "./use-case-response";

describe("Transaction Process Session with vendor-specific accounts", () => {
  const stripePaymentIntentsApiFactory = {
    create: () => mockedStripePaymentIntentsApi,
  } satisfies IStripePaymentIntentsApiFactory;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("When transaction was created with vendor account", () => {
    it("should retrieve payment intent from vendor's Stripe account", async () => {
      const vendorStripeAccountId = "acct_vendor789";

      // Mock transaction recorder to return transaction with vendor account
      const _getTransactionSpy = vi
        .spyOn(
          mockedTransactionRecorderRepoWithVendorAccount,
          "getTransactionByStripePaymentIntentId",
        )
        .mockResolvedValue(
          ok(
            new RecordedTransaction({
              saleorTransactionId: createSaleorTransactionId("mocked-saleor-transaction-id"),
              stripePaymentIntentId: mockedStripePaymentIntentId,
              saleorTransactionFlow: createSaleorTransactionFlow("CHARGE"),
              resolvedTransactionFlow: createResolvedTransactionFlow("CHARGE"),
              selectedPaymentMethod: "card",
              stripeAccountId: vendorStripeAccountId,
              saleorSchemaVersion: mockedSaleorSchemaVersionSupportingPaymentMethodDetails,
            }),
          ),
        );

      // Mock Stripe API to track the call
      const getPaymentIntentSpy = vi
        .spyOn(mockedStripePaymentIntentsApi, "getPaymentIntent")
        .mockImplementationOnce(async () =>
          ok({
            id: mockedStripePaymentIntentId.toString(),
            amount: 100,
            currency: "usd",
            status: "succeeded",
          } as Stripe.PaymentIntent),
        );

      const uc = new TransactionProcessSessionUseCase({
        appConfigRepo: mockedAppConfigRepo,
        stripePaymentIntentsApiFactory,
        transactionRecorder: mockedTransactionRecorderRepoWithVendorAccount,
      });

      const event = getMockedTransactionProcessSessionEvent();

      const result = await uc.execute({
        saleorApiUrl: mockedSaleorApiUrl,
        appId: mockedSaleorAppId,
        event,
      });

      expect(result._unsafeUnwrap()).toBeInstanceOf(
        TransactionProcessSessionUseCaseResponses.Success,
      );

      // Verify transaction was fetched
      expect(_getTransactionSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          appId: mockedSaleorAppId,
          saleorApiUrl: mockedSaleorApiUrl,
        }),
        mockedStripePaymentIntentId,
      );

      // Verify Stripe API was called with vendor's account
      expect(getPaymentIntentSpy).toHaveBeenCalledWith({
        id: mockedStripePaymentIntentId,
        stripeAccount: vendorStripeAccountId,
      });
    });
  });

  describe("When transaction was created with main account", () => {
    it("should retrieve payment intent from main Stripe account", async () => {
      // Mock transaction recorder to return transaction WITHOUT vendor account
      const _getTransactionSpy = vi
        .spyOn(mockedTransactionRecorderRepo, "getTransactionByStripePaymentIntentId")
        .mockResolvedValue(
          ok(
            new RecordedTransaction({
              saleorTransactionId: createSaleorTransactionId("mocked-saleor-transaction-id"),
              stripePaymentIntentId: mockedStripePaymentIntentId,
              saleorTransactionFlow: createSaleorTransactionFlow("CHARGE"),
              resolvedTransactionFlow: createResolvedTransactionFlow("CHARGE"),
              selectedPaymentMethod: "card",
              stripeAccountId: undefined, // No vendor account
              saleorSchemaVersion: mockedSaleorSchemaVersionSupportingPaymentMethodDetails,
            }),
          ),
        );

      const getPaymentIntentSpy = vi
        .spyOn(mockedStripePaymentIntentsApi, "getPaymentIntent")
        .mockImplementationOnce(async () =>
          ok({
            id: mockedStripePaymentIntentId.toString(),
            amount: 100,
            currency: "usd",
            status: "succeeded",
          } as Stripe.PaymentIntent),
        );

      const uc = new TransactionProcessSessionUseCase({
        appConfigRepo: mockedAppConfigRepo,
        stripePaymentIntentsApiFactory,
        transactionRecorder: mockedTransactionRecorderRepo,
      });

      const event = getMockedTransactionProcessSessionEvent();

      const result = await uc.execute({
        saleorApiUrl: mockedSaleorApiUrl,
        appId: mockedSaleorAppId,
        event,
      });

      expect(result._unsafeUnwrap()).toBeInstanceOf(
        TransactionProcessSessionUseCaseResponses.Success,
      );

      // Verify Stripe API was called WITHOUT vendor account
      expect(getPaymentIntentSpy).toHaveBeenCalledWith({
        id: mockedStripePaymentIntentId,
        stripeAccount: undefined,
      });
    });
  });

  describe("Error handling", () => {
    it("should handle payment intent not found on vendor account", async () => {
      const vendorStripeAccountId = "acct_vendor_wrong";

      // Mock transaction with wrong vendor account
      vi.spyOn(
        mockedTransactionRecorderRepo,
        "getTransactionByStripePaymentIntentId",
      ).mockResolvedValue(
        ok(
          new RecordedTransaction({
            saleorTransactionId: createSaleorTransactionId("mocked-saleor-transaction-id"),
            stripePaymentIntentId: mockedStripePaymentIntentId,
            saleorTransactionFlow: createSaleorTransactionFlow("CHARGE"),
            resolvedTransactionFlow: createResolvedTransactionFlow("CHARGE"),
            selectedPaymentMethod: "card",
            stripeAccountId: vendorStripeAccountId,
            saleorSchemaVersion: mockedSaleorSchemaVersionSupportingPaymentMethodDetails,
          }),
        ),
      );

      // Mock Stripe API to return error
      vi.spyOn(mockedStripePaymentIntentsApi, "getPaymentIntent").mockImplementationOnce(async () =>
        err({
          type: "StripeInvalidRequestError",
          code: "resource_missing",
          message: "No such payment_intent",
        } as Stripe.errors.StripeInvalidRequestError),
      );

      const uc = new TransactionProcessSessionUseCase({
        appConfigRepo: mockedAppConfigRepo,
        stripePaymentIntentsApiFactory,
        transactionRecorder: mockedTransactionRecorderRepo,
      });

      const event = getMockedTransactionProcessSessionEvent();

      const result = await uc.execute({
        saleorApiUrl: mockedSaleorApiUrl,
        appId: mockedSaleorAppId,
        event,
      });

      // Should return failure response
      expect(result._unsafeUnwrap()).toBeInstanceOf(
        TransactionProcessSessionUseCaseResponses.Failure,
      );
    });
  });
});
