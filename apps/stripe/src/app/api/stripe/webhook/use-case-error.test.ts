import { APL } from "@saleor/app-sdk/APL";
import { err, ok } from "neverthrow";
import Stripe from "stripe";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { mockedAppConfigRepo } from "@/__tests__/mocks/app-config-repo";
import { mockAdyenWebhookUrl, mockedSaleorTransactionIdBranded } from "@/__tests__/mocks/constants";
import { mockAuthData } from "@/__tests__/mocks/mock-auth-data";
import { mockedStripePaymentIntentId } from "@/__tests__/mocks/mocked-stripe-payment-intent-id";
import { MockedTransactionRecorder } from "@/__tests__/mocks/mocked-transaction-recorder";
import { getMockedPaymentIntentSucceededEvent } from "@/__tests__/mocks/stripe-events/mocked-payment-intent-succeeded";
import { StripeWebhookUseCase } from "@/app/api/stripe/webhook/use-case";
import { WebhookParams } from "@/app/api/stripe/webhook/webhook-params";
import { BaseError } from "@/lib/errors";
import { createResolvedTransactionFlow } from "@/modules/resolved-transaction-flow";
import { createSaleorTransactionFlow } from "@/modules/saleor/saleor-transaction-flow";
import {
  ITransactionEventReporter,
  TransactionEventReportResultResult,
} from "@/modules/saleor/transaction-event-reporter";
import { IStripeEventVerify, StripeEventParsingError } from "@/modules/stripe/types";
import { RecordedTransaction } from "@/modules/transactions-recording/domain/recorded-transaction";

describe("StripeWebhookUseCase - Error cases", () => {
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
        "error": [TransactionRecorderRepo.TransactionMissingError: Transaction not found],
        "responseStatusCode": 500,
      }
    `);
  });

  it("Returns error if event is not supported by StripePaymentIntentHandler", async () => {
    const event = {
      type: "payment_intent.created",
      data: { object: { object: "payment_intent", id: mockedStripePaymentIntentId.toString() } },
    } as Stripe.PaymentIntentCreatedEvent;

    const stripePiId = mockedStripePaymentIntentId;

    eventVerify.verifyEvent.mockImplementationOnce(() => ok(event));

    mockTransactionRecorder.transactions = {
      [stripePiId]: new RecordedTransaction({
        saleorTransactionId: mockedSaleorTransactionIdBranded,
        stripePaymentIntentId: stripePiId,
        saleorTransactionFlow: createSaleorTransactionFlow("CHARGE"),
        resolvedTransactionFlow: createResolvedTransactionFlow("CHARGE"),
        selectedPaymentMethod: "card",
      }),
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

    expect(result._unsafeUnwrapErr()).toMatchInlineSnapshot(`
      StripeWebhookErrorResponse {
        "error": [BaseError: Event is not supported by StripePaymentIntentHandler],
        "responseStatusCode": 500,
      }
    `);
  });
});
