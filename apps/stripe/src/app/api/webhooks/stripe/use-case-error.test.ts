import { type APL } from "@saleor/app-sdk/APL";
import { err, ok } from "neverthrow";
import type Stripe from "stripe";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { mockedAppConfigRepo } from "@/__tests__/mocks/app-config-repo";
import {
  mockAdyenWebhookUrl,
  mockedSaleorSchemaVersionSupportingPaymentMethodDetails,
  mockedSaleorTransactionId,
} from "@/__tests__/mocks/constants";
import { mockAuthData } from "@/__tests__/mocks/mock-auth-data";
import { mockedStripePaymentIntentId } from "@/__tests__/mocks/mocked-stripe-payment-intent-id";
import { mockedStripePaymentIntentsApi } from "@/__tests__/mocks/mocked-stripe-payment-intents-api";
import { MockedTransactionRecorder } from "@/__tests__/mocks/mocked-transaction-recorder";
import { getMockedPaymentIntentSucceededEvent } from "@/__tests__/mocks/stripe-events/mocked-payment-intent-succeeded";
import { BaseError } from "@/lib/errors";
import { createResolvedTransactionFlow } from "@/modules/resolved-transaction-flow";
import { createSaleorTransactionFlow } from "@/modules/saleor/saleor-transaction-flow";
import {
  type ITransactionEventReporter,
  type TransactionEventReportResultResult,
} from "@/modules/saleor/transaction-event-reporter";
import { createStripePaymentIntentId } from "@/modules/stripe/stripe-payment-intent-id";
import { StripeWebhookManager } from "@/modules/stripe/stripe-webhook-manager";
import {
  type IStripeEventVerify,
  type IStripePaymentIntentsApiFactory,
  StripeEventParsingError,
} from "@/modules/stripe/types";
import { RecordedTransaction } from "@/modules/transactions-recording/domain/recorded-transaction";

import { StripeWebhookUseCase } from "./use-case";
import { WebhookParams } from "./webhook-params";

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

  const stripePaymentIntentsApiFactory = {
    create: () => mockedStripePaymentIntentsApi,
  } satisfies IStripePaymentIntentsApiFactory;

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
      webhookManager: new StripeWebhookManager(),
      stripePaymentIntentsApiFactory,
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
      StripeWebhookAppIsNotConfiguredResponse {
        "message": "App is not configured",
        "statusCode": 400,
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
      StripeWebhookAppIsNotConfiguredResponse {
        "message": "App is not configured",
        "statusCode": 400,
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
      StripeWebhookAppIsNotConfiguredResponse {
        "message": "App is not configured",
        "statusCode": 400,
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
      StripeWebhookMalformedRequestResponse {
        "message": "Malformed request",
        "statusCode": 400,
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
      StripeWebhookTransactionMissingResponse {
        "message": "Transaction is missing",
        "statusCode": 400,
      }
    `);
  });

  it("Returns error if payment_intent belongs to a different Saleor installation and does not call DB", async () => {
    const event = getMockedPaymentIntentSucceededEvent();

    event.data.object.metadata = {
      saleor_transaction_id: mockedSaleorTransactionId as string,
      saleor_source_id: "checkout-id-123",
      saleor_source_type: "Checkout",
      saleor_app_id: "different-app-id",
    };

    eventVerify.verifyEvent.mockImplementationOnce(() => ok(event));

    const dbSpy = vi.spyOn(mockTransactionRecorder, "getTransactionByStripePaymentIntentId");

    const result = await instance.execute({
      rawBody: rawEventBody,
      signatureHeader: "test-signature",
      webhookParams: webhookParams,
    });

    expect(result._unsafeUnwrapErr()).toMatchInlineSnapshot(`
      ObjectCreatedOutsideOfSaleorResponse {
        "message": "Object created outside of Saleor is not processable",
        "statusCode": 400,
      }
    `);

    expect(dbSpy).not.toHaveBeenCalled();
    expect(mockEventReporter.reportTransactionEvent).not.toHaveBeenCalled();
  });

  it("Returns error if refund belongs to a different Saleor installation and does not call DB", async () => {
    const event = {
      type: "charge.refund.updated",
      data: {
        object: {
          object: "refund",
          id: "re_id",
          payment_intent: mockedStripePaymentIntentId.toString(),
          metadata: {
            saleor_transaction_id: mockedSaleorTransactionId as string,
            saleor_source_id: "checkout-id-123",
            saleor_source_type: "Checkout",
            saleor_app_id: "different-app-id",
          },
        },
      },
    } as unknown as Stripe.ChargeRefundUpdatedEvent;

    eventVerify.verifyEvent.mockImplementationOnce(() => ok(event));

    const dbSpy = vi.spyOn(mockTransactionRecorder, "getTransactionByStripePaymentIntentId");

    const result = await instance.execute({
      rawBody: rawEventBody,
      signatureHeader: "test-signature",
      webhookParams: webhookParams,
    });

    expect(result._unsafeUnwrapErr()).toMatchInlineSnapshot(`
      ObjectCreatedOutsideOfSaleorResponse {
        "message": "Object created outside of Saleor is not processable",
        "statusCode": 400,
      }
    `);

    expect(dbSpy).not.toHaveBeenCalled();
    expect(mockEventReporter.reportTransactionEvent).not.toHaveBeenCalled();
  });

  it("Processes payment_intent without saleor_app_id for backward compatibility", async () => {
    const event = getMockedPaymentIntentSucceededEvent();

    // Metadata has saleor_transaction_id but no saleor_app_id (old PI)
    event.data.object.metadata = {
      saleor_transaction_id: mockedSaleorTransactionId as string,
      saleor_source_id: "checkout-id-123",
      saleor_source_type: "Checkout",
    };

    const stripePiId = createStripePaymentIntentId(event.data.object.id);

    eventVerify.verifyEvent.mockImplementationOnce(() => ok(event));

    mockTransactionRecorder.transactions = {
      [stripePiId]: new RecordedTransaction({
        saleorTransactionId: mockedSaleorTransactionId,
        stripePaymentIntentId: stripePiId,
        saleorTransactionFlow: createSaleorTransactionFlow("CHARGE"),
        resolvedTransactionFlow: createResolvedTransactionFlow("CHARGE"),
        selectedPaymentMethod: "card",
        saleorSchemaVersion: mockedSaleorSchemaVersionSupportingPaymentMethodDetails,
      }),
    };

    vi.spyOn(mockedStripePaymentIntentsApi, "getPaymentIntent").mockImplementationOnce(async () =>
      ok({
        payment_method: null,
      }),
    );

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

    // Should NOT be rejected - backward compatible
    expect(result._unsafeUnwrap()).toMatchInlineSnapshot(`
      StripeWebhookSuccessResponse {
        "message": "Ok",
        "statusCode": 200,
      }
    `);
  });

  it("Returns error if event is not supported by StripePaymentIntentHandler", async () => {
    const event = {
      type: "payment_intent.created",
      data: {
        object: {
          object: "payment_intent",
          id: mockedStripePaymentIntentId.toString(),
          metadata: {
            saleor_transaction_id: mockedSaleorTransactionId as string,
            saleor_source_id: "checkout-id-123",
            saleor_source_type: "Checkout",
          },
        },
      },
    } as unknown as Stripe.PaymentIntentCreatedEvent;

    const stripePiId = mockedStripePaymentIntentId;

    eventVerify.verifyEvent.mockImplementationOnce(() => ok(event));

    mockTransactionRecorder.transactions = {
      [stripePiId]: new RecordedTransaction({
        saleorTransactionId: mockedSaleorTransactionId,
        stripePaymentIntentId: stripePiId,
        saleorTransactionFlow: createSaleorTransactionFlow("CHARGE"),
        resolvedTransactionFlow: createResolvedTransactionFlow("CHARGE"),
        selectedPaymentMethod: "card",
        saleorSchemaVersion: mockedSaleorSchemaVersionSupportingPaymentMethodDetails,
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
      StripeWebhookSeverErrorResponse {
        "message": "Server error",
        "statusCode": 500,
      }
    `);
  });

  it("Returns error if event is not supported by StripeRefundHandler", async () => {
    const event = {
      type: "refund.created",
      data: {
        object: {
          object: "refund",
          id: "re_id",
          payment_intent: mockedStripePaymentIntentId.toString(),
          metadata: {
            saleor_transaction_id: mockedSaleorTransactionId as string,
            saleor_source_id: "checkout-id-123",
            saleor_source_type: "Checkout",
          },
        },
      },
    } as unknown as Stripe.RefundCreatedEvent;

    const stripePiId = mockedStripePaymentIntentId;

    eventVerify.verifyEvent.mockImplementationOnce(() => ok(event));

    mockTransactionRecorder.transactions = {
      [stripePiId]: new RecordedTransaction({
        saleorTransactionId: mockedSaleorTransactionId,
        stripePaymentIntentId: stripePiId,
        saleorTransactionFlow: createSaleorTransactionFlow("CHARGE"),
        resolvedTransactionFlow: createResolvedTransactionFlow("CHARGE"),
        selectedPaymentMethod: "card",
        saleorSchemaVersion: mockedSaleorSchemaVersionSupportingPaymentMethodDetails,
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
      StripeWebhookSeverErrorResponse {
        "message": "Server error",
        "statusCode": 500,
      }
    `);
  });
});
