import { err } from "neverthrow";
import Stripe from "stripe";
import { describe, expect, it, vi } from "vitest";

import { mockedAppConfigRepo } from "@/__tests__/mocks/app-config-repo";
import { mockedConfigurationId, mockedSaleorAppId } from "@/__tests__/mocks/constants";
import { mockStripeProblemReporter } from "@/__tests__/mocks/mock-stripe-problem-reporter";
import { mockedStripePaymentIntentsApi } from "@/__tests__/mocks/mocked-stripe-payment-intents-api";
import { mockedSaleorApiUrl } from "@/__tests__/mocks/saleor-api-url";
import { getMockedTransactionChargeRequestedEvent } from "@/__tests__/mocks/saleor-events/transaction-charge-requested-event";
import {
  StripeAPIError,
  StripeAuthenticationError,
  StripePermissionError,
} from "@/modules/stripe/stripe-api-error";
import { type IStripePaymentIntentsApiFactory } from "@/modules/stripe/types";

import { TransactionChargeRequestedUseCase } from "./use-case";

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
  createLogger: () => ({
    error: vi.fn(),
    warn: vi.fn(),
    info: vi.fn(),
    debug: vi.fn(),
  }),
}));

describe("TransactionChargeRequestedUseCase - problem reporting", () => {
  const stripePaymentIntentsApiFactory = {
    create: () => mockedStripePaymentIntentsApi,
  } satisfies IStripePaymentIntentsApiFactory;

  it("Reports authentication problem when Stripe returns StripeAuthenticationError", async () => {
    vi.spyOn(mockedStripePaymentIntentsApi, "capturePaymentIntent").mockImplementationOnce(
      async () =>
        err(
          new Stripe.errors.StripeAuthenticationError({
            type: "authentication_error",
            message: "Invalid API key",
          }),
        ),
    );

    const reportSpy = vi.spyOn(mockStripeProblemReporter, "reportApiProblem");

    const uc = new TransactionChargeRequestedUseCase({
      appConfigRepo: mockedAppConfigRepo,
      stripePaymentIntentsApiFactory,
    });

    await uc.execute({
      saleorApiUrl: mockedSaleorApiUrl,
      appId: mockedSaleorAppId,
      event: getMockedTransactionChargeRequestedEvent(),
      problemReporter: mockStripeProblemReporter,
    });

    expect(reportSpy).toHaveBeenCalledWith(expect.any(StripeAuthenticationError), {
      id: mockedConfigurationId,
      name: "config-name",
    });
  });

  it("Reports permission problem when Stripe returns StripePermissionError", async () => {
    vi.spyOn(mockedStripePaymentIntentsApi, "capturePaymentIntent").mockImplementationOnce(
      async () =>
        err(
          new Stripe.errors.StripePermissionError({
            type: "api_error",
            message: "Insufficient permissions",
          }),
        ),
    );

    const reportSpy = vi.spyOn(mockStripeProblemReporter, "reportApiProblem");

    const uc = new TransactionChargeRequestedUseCase({
      appConfigRepo: mockedAppConfigRepo,
      stripePaymentIntentsApiFactory,
    });

    await uc.execute({
      saleorApiUrl: mockedSaleorApiUrl,
      appId: mockedSaleorAppId,
      event: getMockedTransactionChargeRequestedEvent(),
      problemReporter: mockStripeProblemReporter,
    });

    expect(reportSpy).toHaveBeenCalledWith(expect.any(StripePermissionError), {
      id: mockedConfigurationId,
      name: "config-name",
    });
  });

  it("Calls reportApiProblem with non-reportable error when Stripe returns other error", async () => {
    vi.spyOn(mockedStripePaymentIntentsApi, "capturePaymentIntent").mockImplementationOnce(
      async () =>
        err(
          new Stripe.errors.StripeAPIError({
            type: "api_error",
            message: "Something went wrong",
          }),
        ),
    );

    const reportSpy = vi.spyOn(mockStripeProblemReporter, "reportApiProblem");

    const uc = new TransactionChargeRequestedUseCase({
      appConfigRepo: mockedAppConfigRepo,
      stripePaymentIntentsApiFactory,
    });

    await uc.execute({
      saleorApiUrl: mockedSaleorApiUrl,
      appId: mockedSaleorAppId,
      event: getMockedTransactionChargeRequestedEvent(),
      problemReporter: mockStripeProblemReporter,
    });

    expect(reportSpy).toHaveBeenCalledWith(expect.any(StripeAPIError), {
      id: mockedConfigurationId,
      name: "config-name",
    });
  });
});
