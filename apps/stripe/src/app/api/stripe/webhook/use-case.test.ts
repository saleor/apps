import { APL } from "@saleor/app-sdk/APL";
import { err, ok } from "neverthrow";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { mockedAppConfigRepo } from "@/__tests__/mocks/app-config-repo";
import { mockAdyenWebhookUrl, mockedSaleorTransactionId } from "@/__tests__/mocks/constants";
import { mockAuthData } from "@/__tests__/mocks/mock-auth-data";
import { MockedTransactionRecorder } from "@/__tests__/mocks/mocked-transaction-recorder";
import { getMockedPaymentIntentSucceededEvent } from "@/__tests__/mocks/stripe-events/mocked-payment-intent-succeeded";
import { StripeWebhookUseCase } from "@/app/api/stripe/webhook/use-case";
import { WebhookParams } from "@/app/api/stripe/webhook/webhook-params";
import { BaseError } from "@/lib/errors";
import {
  ITransactionEventReporter,
  TransactionEventReportResultResult,
} from "@/modules/saleor/transaction-event-reporter";
import { createStripePaymentIntentId } from "@/modules/stripe/stripe-payment-intent-id";
import { IStripeEventVerify, StripeEventParsingError } from "@/modules/stripe/types";
import { RecordedTransaction } from "@/modules/transactions-recording/transaction-recorder";

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

  const mockEventReporter = {
    reportTransactionEvent: vi.fn(),
  } satisfies ITransactionEventReporter;

  const mockTransactionRecorder = new MockedTransactionRecorder();

  beforeEach(() => {
    mockApl.get.mockImplementation(async () => mockAuthData);
    mockTransactionRecorder.reset();

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

    it("Returns error if transaction not previously recorded", async () => {
      eventVerify.verifyEvent.mockImplementationOnce(() =>
        ok(getMockedPaymentIntentSucceededEvent()),
      );

      const result = await instance.execute({
        rawBody: rawEventBody,
        signatureHeader: "test-signature",
        webhookParams: webhookParams,
      });

      expect(result._unsafeUnwrapErr()).toMatchInlineSnapshot(`
        StripeWebhookErrorResponse {
          "error": [TransactionRecorder.TransactionMissingError: Transaction not found],
          "responseStatusCode": 500,
        }
      `);
    });
  });

  describe("Success cases", () => {
    describe("Stripe.PaymentIntentSucceededEvent", () => {
      it("Reports CHARGE_SUCCESS transaction event to Saleor", async () => {
        const event = getMockedPaymentIntentSucceededEvent();
        const stripePiId = createStripePaymentIntentId(event.data.object.id)._unsafeUnwrap();

        eventVerify.verifyEvent.mockImplementationOnce(() => ok(event));

        mockTransactionRecorder.transactions = {
          [stripePiId]: new RecordedTransaction(mockedSaleorTransactionId, stripePiId, "CHARGE"),
        };

        mockEventReporter.reportTransactionEvent.mockImplementationOnce(async () => {
          const data: TransactionEventReportResultResult = {
            createdEventId: "TEST_EVENT_ID",
          };

          return ok(data);
        });

        const result = await instance.execute({
          rawBody: "TEST BODY",
          signatureHeader: "SIGNATURE",
          webhookParams: webhookParams,
        });

        expect(result._unsafeUnwrap()).toMatchInlineSnapshot(`
          StripeWebhookSuccessResponse {
            "responseStatusCode": 200,
          }
        `);

        expect(mockEventReporter.reportTransactionEvent).toHaveBeenCalledOnce();

        expect(vi.mocked(mockEventReporter.reportTransactionEvent).mock.calls[0][0])
          .toMatchInlineSnapshot(`
            {
              "amount": SaleorMoney {
                "amount": 10.13,
                "currency": "USD",
              },
              "message": "Successfully charged",
              "pspReference": "pi_TEST_TEST_TEST",
              "time": "2025-01-31T23:00:00.000Z",
              "transactionId": "mocked-transaction-id",
              "type": "CHARGE_SUCCESS",
            }
          `);
      });

      it("Reports AUTHORIZATION_SUCCESS transaction event to Saleor", async () => {
        const event = getMockedPaymentIntentSucceededEvent();
        const stripePiId = createStripePaymentIntentId(event.data.object.id)._unsafeUnwrap();

        eventVerify.verifyEvent.mockImplementationOnce(() => ok(event));

        mockTransactionRecorder.transactions = {
          [stripePiId]: new RecordedTransaction(
            mockedSaleorTransactionId,
            stripePiId,
            "AUTHORIZATION",
          ),
        };

        mockEventReporter.reportTransactionEvent.mockImplementationOnce(async () => {
          const data: TransactionEventReportResultResult = {
            createdEventId: "TEST_EVENT_ID",
          };

          return ok(data);
        });

        const result = await instance.execute({
          rawBody: "TEST BODY",
          signatureHeader: "SIGNATURE",
          webhookParams: webhookParams,
        });

        expect(result._unsafeUnwrap()).toMatchInlineSnapshot(`
          StripeWebhookSuccessResponse {
            "responseStatusCode": 200,
          }
        `);

        expect(mockEventReporter.reportTransactionEvent).toHaveBeenCalledOnce();

        expect(vi.mocked(mockEventReporter.reportTransactionEvent).mock.calls[0][0])
          .toMatchInlineSnapshot(`
            {
              "amount": SaleorMoney {
                "amount": 15.11,
                "currency": "USD",
              },
              "message": "Successfully authorized",
              "pspReference": "pi_TEST_TEST_TEST",
              "time": "2025-01-31T23:00:00.000Z",
              "transactionId": "mocked-transaction-id",
              "type": "AUTHORIZATION_SUCCESS",
            }
          `);
      });
    });
  });
});
