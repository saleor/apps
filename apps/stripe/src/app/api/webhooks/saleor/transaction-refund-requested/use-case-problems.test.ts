import { err } from "neverthrow";
import Stripe from "stripe";
import { describe, expect, it, vi } from "vitest";

import { mockedAppConfigRepo } from "@/__tests__/mocks/app-config-repo";
import { mockedConfigurationId, mockedSaleorAppId } from "@/__tests__/mocks/constants";
import { mockStripeProblemReporter } from "@/__tests__/mocks/mock-stripe-problem-reporter";
import { mockedStripeRefundsApi } from "@/__tests__/mocks/mocked-stripe-refunds-api";
import { mockedSaleorApiUrl } from "@/__tests__/mocks/saleor-api-url";
import { getMockedTransactionRefundRequestedEvent } from "@/__tests__/mocks/saleor-events/transaction-refund-request-event";
import {
  StripeAPIError,
  StripeAuthenticationError,
  StripePermissionError,
} from "@/modules/stripe/stripe-api-error";
import { type IStripeRefundsApiFactory } from "@/modules/stripe/types";

import { TransactionRefundRequestedUseCase } from "./use-case";

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

describe("TransactionRefundRequestedUseCase - problem reporting", () => {
  const stripeRefundsApiFactory = {
    create: () => mockedStripeRefundsApi,
  } satisfies IStripeRefundsApiFactory;

  it("Reports authentication problem when Stripe returns StripeAuthenticationError", async () => {
    vi.spyOn(mockedStripeRefundsApi, "createRefund").mockImplementationOnce(async () =>
      err(
        new Stripe.errors.StripeAuthenticationError({
          type: "authentication_error",
          message: "Invalid API key",
        }),
      ),
    );

    const reportSpy = vi.spyOn(mockStripeProblemReporter, "reportApiProblem");

    const uc = new TransactionRefundRequestedUseCase({
      appConfigRepo: mockedAppConfigRepo,
      stripeRefundsApiFactory,
    });

    await uc.execute({
      saleorApiUrl: mockedSaleorApiUrl,
      appId: mockedSaleorAppId,
      event: getMockedTransactionRefundRequestedEvent(),
      problemReporter: mockStripeProblemReporter,
    });

    expect(reportSpy).toHaveBeenCalledWith(expect.any(StripeAuthenticationError), {
      id: mockedConfigurationId,
      name: "config-name",
    });
  });

  it("Reports permission problem when Stripe returns StripePermissionError", async () => {
    vi.spyOn(mockedStripeRefundsApi, "createRefund").mockImplementationOnce(async () =>
      err(
        new Stripe.errors.StripePermissionError({
          type: "api_error",
          message: "Insufficient permissions",
        }),
      ),
    );

    const reportSpy = vi.spyOn(mockStripeProblemReporter, "reportApiProblem");

    const uc = new TransactionRefundRequestedUseCase({
      appConfigRepo: mockedAppConfigRepo,
      stripeRefundsApiFactory,
    });

    await uc.execute({
      saleorApiUrl: mockedSaleorApiUrl,
      appId: mockedSaleorAppId,
      event: getMockedTransactionRefundRequestedEvent(),
      problemReporter: mockStripeProblemReporter,
    });

    expect(reportSpy).toHaveBeenCalledWith(expect.any(StripePermissionError), {
      id: mockedConfigurationId,
      name: "config-name",
    });
  });

  it("Calls reportApiProblem with non-reportable error when Stripe returns other error", async () => {
    vi.spyOn(mockedStripeRefundsApi, "createRefund").mockImplementationOnce(async () =>
      err(
        new Stripe.errors.StripeAPIError({
          type: "api_error",
          message: "Something went wrong",
        }),
      ),
    );

    const reportSpy = vi.spyOn(mockStripeProblemReporter, "reportApiProblem");

    const uc = new TransactionRefundRequestedUseCase({
      appConfigRepo: mockedAppConfigRepo,
      stripeRefundsApiFactory,
    });

    await uc.execute({
      saleorApiUrl: mockedSaleorApiUrl,
      appId: mockedSaleorAppId,
      event: getMockedTransactionRefundRequestedEvent(),
      problemReporter: mockStripeProblemReporter,
    });

    expect(reportSpy).toHaveBeenCalledWith(expect.any(StripeAPIError), {
      id: mockedConfigurationId,
      name: "config-name",
    });
  });
});
