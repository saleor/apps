import { APL } from "@saleor/app-sdk/APL";
import { err, ok } from "neverthrow";
import Stripe from "stripe";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { mockedAppConfigRepo } from "@/__tests__/mocks/app-config-repo";
import { mockAdyenWebhookUrl } from "@/__tests__/mocks/constants";
import { mockAuthData } from "@/__tests__/mocks/mock-auth-data";
import { StripeWebhookUseCase } from "@/app/api/stripe/webhook/use-case";
import { WebhookParams } from "@/app/api/stripe/webhook/webhook-params";
import { BaseError } from "@/lib/errors";
import { ITransactionEventReporter } from "@/modules/saleor/transaction-event-reporter";
import { IStripeEventVerify, StripeEventParsingError } from "@/modules/stripe/types";
import { TransactionRecorder } from "@/modules/transactions-recording/transaction-recorder";

describe("StripeWebhookUseCase", () => {
  const rawEventBody = JSON.stringify({ id: 1 });

  const mockApl = {
    get: vi.fn(),
    set: vi.fn(),
    delete: vi.fn(),
    getAll: vi.fn(),
  } satisfies APL;

  let instance: StripeWebhookUseCase;

  const eventVerify = {
    verifyEvent: vi.fn(),
  } satisfies IStripeEventVerify;

  const webhookParams = WebhookParams.createFromWebhookUrl(mockAdyenWebhookUrl)._unsafeUnwrap();

  const mockEventReporter: ITransactionEventReporter = {
    reportTransactionEvent: vi.fn(),
  };

  const mockTransactionRecorder: TransactionRecorder = {
    recordTransaction: vi.fn(),
    getTransactionByStripePaymentIntentId: vi.fn(),
  };

  beforeEach(() => {
    mockApl.get.mockImplementation(async () => mockAuthData);

    instance = new StripeWebhookUseCase({
      apl: mockApl,
      appConfigRepo: mockedAppConfigRepo,
      webhookEventVerifyFactory: () => eventVerify,
      transactionEventReporterFactory() {
        return mockEventReporter;
      },
      transactionRecorder: mockTransactionRecorder,
    });
  });

  describe("Error cases", () => {
    it("Returns error when AuthData not found", async () => {
      mockApl.get.mockImplementationOnce(async () => undefined);

      const result = await instance.execute({
        rawBody: rawEventBody,
        signatureHeader: "test-signature",
        webhookParams: webhookParams,
      });

      expect(result._unsafeUnwrapErr()).toMatchInlineSnapshot(`
        StripeWebhookErrorResponse {
          "error": [BaseError: Missing Saleor Auth Data. App installation is broken],
          "responseStatusCode": 500,
        }
      `);
    });

    it("Returns error when Config can not be fetched", async () => {
      vi.spyOn(mockedAppConfigRepo, "getStripeConfig").mockImplementationOnce(async () =>
        err(new BaseError("Test error - cant fetch config")),
      );

      const result = await instance.execute({
        rawBody: rawEventBody,
        signatureHeader: "test-signature",
        webhookParams: webhookParams,
      });

      expect(result._unsafeUnwrapErr()).toMatchInlineSnapshot(`
        StripeWebhookErrorResponse {
          "error": [BaseError: Test error - cant fetch config
        Failed to fetch config from database],
          "responseStatusCode": 500,
        }
      `);
    });

    it("Returns error when Config for specific channel is empty", async () => {
      vi.spyOn(mockedAppConfigRepo, "getStripeConfig").mockImplementationOnce(async () => ok(null));

      const result = await instance.execute({
        rawBody: rawEventBody,
        signatureHeader: "test-signature",
        webhookParams: webhookParams,
      });

      expect(result._unsafeUnwrapErr()).toMatchInlineSnapshot(`
        StripeWebhookErrorResponse {
          "error": [BaseError: Config missing, app is not configured properly],
          "responseStatusCode": 500,
        }
      `);
    });

    it("Returns error when event from Stripe can not be parsed", async () => {
      eventVerify.verifyEvent.mockImplementationOnce(() =>
        err(new StripeEventParsingError("Error because its test")),
      );

      const result = await instance.execute({
        rawBody: rawEventBody,
        signatureHeader: "test-signature",
        webhookParams: webhookParams,
      });

      expect(result._unsafeUnwrapErr()).toMatchInlineSnapshot(`
        StripeWebhookErrorResponse {
          "error": [StripeEventParsingError: Error because its test],
          "responseStatusCode": 500,
        }
      `);
    });
  });

  describe("Success cases", () => {
    it("Returns success response if nothing breaks", async () => {
      eventVerify.verifyEvent.mockImplementationOnce(() =>
        ok({ id: "Stripe PI ID" } as Stripe.Event),
      );

      const result = await instance.execute({
        rawBody: rawEventBody,
        signatureHeader: "test-signature",
        webhookParams: webhookParams,
      });

      expect(result._unsafeUnwrap()).toMatchInlineSnapshot(`
        StripeWebhookSuccessResponse {
          "responseStatusCode": 200,
        }
      `);
    });

    it.todo("Reports transaction event to Saleor");
  });
});
