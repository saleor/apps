import { err } from "neverthrow";
import Stripe from "stripe";
import { describe, expect, it, vi } from "vitest";

import { mockedAppConfigRepo } from "@/__tests__/mocks/app-config-repo";
import { mockedConfigurationId, mockedSaleorAppId } from "@/__tests__/mocks/constants";
import { mockAuthData } from "@/__tests__/mocks/mock-auth-data";
import { mockStripeProblemReporter } from "@/__tests__/mocks/mock-stripe-problem-reporter";
import { getMockedRecordedTransaction } from "@/__tests__/mocks/mocked-recorded-transaction";
import { mockedStripePaymentIntentsApi } from "@/__tests__/mocks/mocked-stripe-payment-intents-api";
import { MockedTransactionRecorder } from "@/__tests__/mocks/mocked-transaction-recorder";
import { mockedSaleorApiUrl } from "@/__tests__/mocks/saleor-api-url";
import { getMockedTransactionProcessSessionEvent } from "@/__tests__/mocks/saleor-events/transaction-process-session-event";
import {
  StripeAPIError,
  StripeAuthenticationError,
  StripePermissionError,
} from "@/modules/stripe/stripe-api-error";
import { type IStripePaymentIntentsApiFactory } from "@/modules/stripe/types";

import { TransactionProcessSessionUseCase } from "./use-case";

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

describe("TransactionProcessSessionUseCase - problem reporting", () => {
  const stripePaymentIntentsApiFactory = {
    create: () => mockedStripePaymentIntentsApi,
  } satisfies IStripePaymentIntentsApiFactory;

  it("Reports authentication problem when Stripe returns StripeAuthenticationError", async () => {
    const mockedTransactionRecorder = new MockedTransactionRecorder();

    mockedTransactionRecorder.recordTransaction(mockAuthData, getMockedRecordedTransaction());

    vi.spyOn(mockedStripePaymentIntentsApi, "getPaymentIntent").mockImplementationOnce(async () =>
      err(
        new Stripe.errors.StripeAuthenticationError({
          type: "authentication_error",
          message: "Invalid API key",
        }),
      ),
    );

    const reportSpy = vi.spyOn(mockStripeProblemReporter, "reportApiProblem");

    const uc = new TransactionProcessSessionUseCase({
      appConfigRepo: mockedAppConfigRepo,
      stripePaymentIntentsApiFactory,
      transactionRecorder: mockedTransactionRecorder,
    });

    await uc.execute({
      saleorApiUrl: mockedSaleorApiUrl,
      appId: mockedSaleorAppId,
      event: getMockedTransactionProcessSessionEvent(),
      problemReporter: mockStripeProblemReporter,
    });

    expect(reportSpy).toHaveBeenCalledWith(expect.any(StripeAuthenticationError), {
      id: mockedConfigurationId,
      name: "config-name",
    });
  });

  it("Reports permission problem when Stripe returns StripePermissionError", async () => {
    const mockedTransactionRecorder = new MockedTransactionRecorder();

    mockedTransactionRecorder.recordTransaction(mockAuthData, getMockedRecordedTransaction());

    vi.spyOn(mockedStripePaymentIntentsApi, "getPaymentIntent").mockImplementationOnce(async () =>
      err(
        new Stripe.errors.StripePermissionError({
          type: "api_error",
          message: "Insufficient permissions",
        }),
      ),
    );

    const reportSpy = vi.spyOn(mockStripeProblemReporter, "reportApiProblem");

    const uc = new TransactionProcessSessionUseCase({
      appConfigRepo: mockedAppConfigRepo,
      stripePaymentIntentsApiFactory,
      transactionRecorder: mockedTransactionRecorder,
    });

    await uc.execute({
      saleorApiUrl: mockedSaleorApiUrl,
      appId: mockedSaleorAppId,
      event: getMockedTransactionProcessSessionEvent(),
      problemReporter: mockStripeProblemReporter,
    });

    expect(reportSpy).toHaveBeenCalledWith(expect.any(StripePermissionError), {
      id: mockedConfigurationId,
      name: "config-name",
    });
  });

  it("Calls reportApiProblem with non-reportable error when Stripe returns other error", async () => {
    const mockedTransactionRecorder = new MockedTransactionRecorder();

    mockedTransactionRecorder.recordTransaction(mockAuthData, getMockedRecordedTransaction());

    vi.spyOn(mockedStripePaymentIntentsApi, "getPaymentIntent").mockImplementationOnce(async () =>
      err(
        new Stripe.errors.StripeAPIError({
          type: "api_error",
          message: "Something went wrong",
        }),
      ),
    );

    const reportSpy = vi.spyOn(mockStripeProblemReporter, "reportApiProblem");

    const uc = new TransactionProcessSessionUseCase({
      appConfigRepo: mockedAppConfigRepo,
      stripePaymentIntentsApiFactory,
      transactionRecorder: mockedTransactionRecorder,
    });

    await uc.execute({
      saleorApiUrl: mockedSaleorApiUrl,
      appId: mockedSaleorAppId,
      event: getMockedTransactionProcessSessionEvent(),
      problemReporter: mockStripeProblemReporter,
    });

    expect(reportSpy).toHaveBeenCalledWith(expect.any(StripeAPIError), {
      id: mockedConfigurationId,
      name: "config-name",
    });
  });
});
