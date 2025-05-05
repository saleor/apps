import { APL } from "@saleor/app-sdk/APL";
import { ok } from "neverthrow";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { mockedAppConfigRepo } from "@/__tests__/mocks/app-config-repo";
import { mockAdyenWebhookUrl, mockedSaleorTransactionIdBranded } from "@/__tests__/mocks/constants";
import { mockAuthData } from "@/__tests__/mocks/mock-auth-data";
import { MockedTransactionRecorder } from "@/__tests__/mocks/mocked-transaction-recorder";
import { getMockedPaymentIntentAmountCapturableUpdatedEvent } from "@/__tests__/mocks/stripe-events/mocked-payment-intent-amount-capturable-updated";
import { getMockedPaymentIntentPaymentFailedEvent } from "@/__tests__/mocks/stripe-events/mocked-payment-intent-failed";
import { getMockedPaymentIntentProcessingEvent } from "@/__tests__/mocks/stripe-events/mocked-payment-intent-processing";
import { getMockedPaymentIntentRequiresActionEvent } from "@/__tests__/mocks/stripe-events/mocked-payment-intent-requires-action";
import { getMockedPaymentIntentSucceededEvent } from "@/__tests__/mocks/stripe-events/mocked-payment-intent-succeeded";
import { createResolvedTransactionFlow } from "@/modules/resolved-transaction-flow";
import { createSaleorTransactionFlow } from "@/modules/saleor/saleor-transaction-flow";
import {
  ITransactionEventReporter,
  TransactionEventReportResultResult,
} from "@/modules/saleor/transaction-event-reporter";
import { createStripePaymentIntentId } from "@/modules/stripe/stripe-payment-intent-id";
import { IStripeEventVerify } from "@/modules/stripe/types";
import { RecordedTransaction } from "@/modules/transactions-recording/domain/recorded-transaction";

import { StripeWebhookUseCase } from "./use-case";
import { WebhookParams } from "./webhook-params";

describe("StripeWebhookUseCase - Success cases", () => {
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

  it("Reports CHARGE_SUCCESS transaction event to Saleor when handling payment_intent.success event and resolvedFlow is CHARGE", async () => {
    const event = getMockedPaymentIntentSucceededEvent();
    const stripePiId = createStripePaymentIntentId(event.data.object.id);

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

    expect(result._unsafeUnwrap()).toMatchInlineSnapshot(`
        StripeWebhookSuccessResponse {
          "responseStatusCode": 200,
        }
      `);

    expect(mockEventReporter.reportTransactionEvent).toHaveBeenCalledOnce();

    expect(
      vi.mocked(mockEventReporter.reportTransactionEvent).mock.calls[0][0],
    ).toMatchInlineSnapshot(
      {
        time: expect.toSatisfy(
          (d) => new Date(d).getTime() === new Date(event.data.object.created * 1000).getTime(),
        ),
      },
      `
      {
        "actions": [],
        "amount": SaleorMoney {
          "amount": 10.13,
          "currency": "USD",
        },
        "externalReference": "https://dashboard.stripe.com/payments/pi_TEST_TEST_TEST",
        "message": "Payment intent succeeded",
        "pspReference": "pi_TEST_TEST_TEST",
        "time": toSatisfy<[Function anonymous]>,
        "transactionId": "mocked-transaction-id",
        "type": "CHARGE_SUCCESS",
      }
    `,
    );
  });

  it("Reports CHARGE_SUCCESS transaction event to Saleor when handling payment_intent.success event resolvedFlow is AUTHORIZATION", async () => {
    const event = getMockedPaymentIntentSucceededEvent();
    const stripePiId = createStripePaymentIntentId(event.data.object.id);

    eventVerify.verifyEvent.mockImplementationOnce(() => ok(event));

    mockTransactionRecorder.transactions = {
      [stripePiId]: new RecordedTransaction({
        saleorTransactionId: mockedSaleorTransactionIdBranded,
        stripePaymentIntentId: stripePiId,
        saleorTransactionFlow: createSaleorTransactionFlow("AUTHORIZATION"),
        resolvedTransactionFlow: createResolvedTransactionFlow("AUTHORIZATION"),
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

    expect(result._unsafeUnwrap()).toMatchInlineSnapshot(`
        StripeWebhookSuccessResponse {
          "responseStatusCode": 200,
        }
      `);

    expect(mockEventReporter.reportTransactionEvent).toHaveBeenCalledOnce();

    expect(
      vi.mocked(mockEventReporter.reportTransactionEvent).mock.calls[0][0],
    ).toMatchInlineSnapshot(
      {
        time: expect.toSatisfy(
          (d) => new Date(d).getTime() === new Date(event.data.object.created * 1000).getTime(),
        ),
      },
      `
      {
        "actions": [],
        "amount": SaleorMoney {
          "amount": 10.13,
          "currency": "USD",
        },
        "externalReference": "https://dashboard.stripe.com/payments/pi_TEST_TEST_TEST",
        "message": "Payment intent succeeded",
        "pspReference": "pi_TEST_TEST_TEST",
        "time": toSatisfy<[Function anonymous]>,
        "transactionId": "mocked-transaction-id",
        "type": "CHARGE_SUCCESS",
      }
    `,
    );
  });

  it("Reports CHARGE_ACTION_REQUIRED transaction event to Saleor when handling payment_intent.requires_action event", async () => {
    const event = getMockedPaymentIntentRequiresActionEvent();
    const stripePiId = createStripePaymentIntentId(event.data.object.id);

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

    expect(result._unsafeUnwrap()).toMatchInlineSnapshot(`
        StripeWebhookSuccessResponse {
          "responseStatusCode": 200,
        }
      `);

    expect(mockEventReporter.reportTransactionEvent).toHaveBeenCalledOnce();

    expect(
      vi.mocked(mockEventReporter.reportTransactionEvent).mock.calls[0][0],
    ).toMatchInlineSnapshot(
      {
        time: expect.toSatisfy(
          (d) => new Date(d).getTime() === new Date(event.data.object.created * 1000).getTime(),
        ),
      },
      `
      {
        "actions": [],
        "amount": SaleorMoney {
          "amount": 10.13,
          "currency": "USD",
        },
        "externalReference": "https://dashboard.stripe.com/payments/pi_TEST_TEST_TEST",
        "message": "Payment intent requires action",
        "pspReference": "pi_TEST_TEST_TEST",
        "time": toSatisfy<[Function anonymous]>,
        "transactionId": "mocked-transaction-id",
        "type": "CHARGE_ACTION_REQUIRED",
      }
    `,
    );
  });

  it("Reports AUTHORIZATION_ACTION_REQUIRED transaction event to Saleor when handling payment_intent.requires_action event", async () => {
    const event = getMockedPaymentIntentRequiresActionEvent();
    const stripePiId = createStripePaymentIntentId(event.data.object.id);

    eventVerify.verifyEvent.mockImplementationOnce(() => ok(event));

    mockTransactionRecorder.transactions = {
      [stripePiId]: new RecordedTransaction({
        saleorTransactionId: mockedSaleorTransactionIdBranded,
        stripePaymentIntentId: stripePiId,
        saleorTransactionFlow: createSaleorTransactionFlow("AUTHORIZATION"),
        resolvedTransactionFlow: createResolvedTransactionFlow("AUTHORIZATION"),
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

    expect(result._unsafeUnwrap()).toMatchInlineSnapshot(`
        StripeWebhookSuccessResponse {
          "responseStatusCode": 200,
        }
      `);

    expect(mockEventReporter.reportTransactionEvent).toHaveBeenCalledOnce();

    expect(
      vi.mocked(mockEventReporter.reportTransactionEvent).mock.calls[0][0],
    ).toMatchInlineSnapshot(
      {
        time: expect.toSatisfy(
          (d) => new Date(d).getTime() === new Date(event.data.object.created * 1000).getTime(),
        ),
      },
      `
      {
        "actions": [],
        "amount": SaleorMoney {
          "amount": 10.13,
          "currency": "USD",
        },
        "externalReference": "https://dashboard.stripe.com/payments/pi_TEST_TEST_TEST",
        "message": "Payment intent requires action",
        "pspReference": "pi_TEST_TEST_TEST",
        "time": toSatisfy<[Function anonymous]>,
        "transactionId": "mocked-transaction-id",
        "type": "AUTHORIZATION_ACTION_REQUIRED",
      }
    `,
    );
  });

  it("Report CHARGE_REQUEST transaction event to Saleor when handling payment_intent.processing event", async () => {
    const event = getMockedPaymentIntentProcessingEvent();
    const stripePiId = createStripePaymentIntentId(event.data.object.id);

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

    expect(result._unsafeUnwrap()).toMatchInlineSnapshot(`
        StripeWebhookSuccessResponse {
          "responseStatusCode": 200,
        }
      `);

    expect(mockEventReporter.reportTransactionEvent).toHaveBeenCalledOnce();

    expect(
      vi.mocked(mockEventReporter.reportTransactionEvent).mock.calls[0][0],
    ).toMatchInlineSnapshot(
      {
        time: expect.toSatisfy(
          (d) => new Date(d).getTime() === new Date(event.data.object.created * 1000).getTime(),
        ),
      },
      `
      {
        "actions": [],
        "amount": SaleorMoney {
          "amount": 10.13,
          "currency": "USD",
        },
        "externalReference": "https://dashboard.stripe.com/payments/pi_TEST_TEST_TEST",
        "message": "Payment intent is processing",
        "pspReference": "pi_TEST_TEST_TEST",
        "time": toSatisfy<[Function anonymous]>,
        "transactionId": "mocked-transaction-id",
        "type": "CHARGE_REQUEST",
      }
    `,
    );
  });

  it("Report AUTHORIZATION_REQUEST transaction event to Saleor when handling payment_intent.processing event", async () => {
    const event = getMockedPaymentIntentProcessingEvent();
    const stripePiId = createStripePaymentIntentId(event.data.object.id);

    eventVerify.verifyEvent.mockImplementationOnce(() => ok(event));

    mockTransactionRecorder.transactions = {
      [stripePiId]: new RecordedTransaction({
        saleorTransactionId: mockedSaleorTransactionIdBranded,
        stripePaymentIntentId: stripePiId,
        saleorTransactionFlow: createSaleorTransactionFlow("AUTHORIZATION"),
        resolvedTransactionFlow: createResolvedTransactionFlow("AUTHORIZATION"),
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

    expect(result._unsafeUnwrap()).toMatchInlineSnapshot(`
        StripeWebhookSuccessResponse {
          "responseStatusCode": 200,
        }
      `);

    expect(mockEventReporter.reportTransactionEvent).toHaveBeenCalledOnce();

    expect(
      vi.mocked(mockEventReporter.reportTransactionEvent).mock.calls[0][0],
    ).toMatchInlineSnapshot(
      {
        time: expect.toSatisfy(
          (d) => new Date(d).getTime() === new Date(event.data.object.created * 1000).getTime(),
        ),
      },
      `
      {
        "actions": [],
        "amount": SaleorMoney {
          "amount": 10.13,
          "currency": "USD",
        },
        "externalReference": "https://dashboard.stripe.com/payments/pi_TEST_TEST_TEST",
        "message": "Payment intent is processing",
        "pspReference": "pi_TEST_TEST_TEST",
        "time": toSatisfy<[Function anonymous]>,
        "transactionId": "mocked-transaction-id",
        "type": "AUTHORIZATION_REQUEST",
      }
    `,
    );
  });

  it("Reports CHARGE_FAILED transaction event to Saleor when handling payment_intent.payment_failed event", async () => {
    const event = getMockedPaymentIntentPaymentFailedEvent();
    const stripePiId = createStripePaymentIntentId(event.data.object.id);

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

    expect(result._unsafeUnwrap()).toMatchInlineSnapshot(`
        StripeWebhookSuccessResponse {
          "responseStatusCode": 200,
        }
      `);

    expect(mockEventReporter.reportTransactionEvent).toHaveBeenCalledOnce();

    expect(
      vi.mocked(mockEventReporter.reportTransactionEvent).mock.calls[0][0],
    ).toMatchInlineSnapshot(
      {
        time: expect.toSatisfy(
          (d) => new Date(d).getTime() === new Date(event.data.object.created * 1000).getTime(),
        ),
      },
      `
      {
        "actions": [
          "CHARGE",
        ],
        "amount": SaleorMoney {
          "amount": 10.13,
          "currency": "USD",
        },
        "externalReference": "https://dashboard.stripe.com/payments/pi_TEST_TEST_TEST",
        "message": "Payment intent was cancelled",
        "pspReference": "pi_TEST_TEST_TEST",
        "time": toSatisfy<[Function anonymous]>,
        "transactionId": "mocked-transaction-id",
        "type": "CHARGE_FAILURE",
      }
    `,
    );
  });

  it("Reports AUTHORIZATION_FAILED transaction event to Saleor when handling payment_intent.payment_failed event", async () => {
    const event = getMockedPaymentIntentPaymentFailedEvent();
    const stripePiId = createStripePaymentIntentId(event.data.object.id);

    eventVerify.verifyEvent.mockImplementationOnce(() => ok(event));

    mockTransactionRecorder.transactions = {
      [stripePiId]: new RecordedTransaction({
        saleorTransactionId: mockedSaleorTransactionIdBranded,
        stripePaymentIntentId: stripePiId,
        saleorTransactionFlow: createSaleorTransactionFlow("AUTHORIZATION"),
        resolvedTransactionFlow: createResolvedTransactionFlow("AUTHORIZATION"),
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

    expect(result._unsafeUnwrap()).toMatchInlineSnapshot(`
        StripeWebhookSuccessResponse {
          "responseStatusCode": 200,
        }
      `);

    expect(mockEventReporter.reportTransactionEvent).toHaveBeenCalledOnce();

    expect(
      vi.mocked(mockEventReporter.reportTransactionEvent).mock.calls[0][0],
    ).toMatchInlineSnapshot(
      {
        time: expect.toSatisfy(
          (d) => new Date(d).getTime() === new Date(event.data.object.created * 1000).getTime(),
        ),
      },
      `
      {
        "actions": [],
        "amount": SaleorMoney {
          "amount": 10.13,
          "currency": "USD",
        },
        "externalReference": "https://dashboard.stripe.com/payments/pi_TEST_TEST_TEST",
        "message": "Payment intent was cancelled",
        "pspReference": "pi_TEST_TEST_TEST",
        "time": toSatisfy<[Function anonymous]>,
        "transactionId": "mocked-transaction-id",
        "type": "AUTHORIZATION_FAILURE",
      }
    `,
    );
  });

  it("Reports AUTHORIZATION_SUCCESS transaction event to Saleor when handling payment_intent.amount_capturable_updated event", async () => {
    const event = getMockedPaymentIntentAmountCapturableUpdatedEvent();

    const stripePiId = createStripePaymentIntentId(event.data.object.id);

    eventVerify.verifyEvent.mockImplementationOnce(() => ok(event));

    mockTransactionRecorder.transactions = {
      [stripePiId]: new RecordedTransaction({
        saleorTransactionId: mockedSaleorTransactionIdBranded,
        stripePaymentIntentId: stripePiId,
        saleorTransactionFlow: createSaleorTransactionFlow("AUTHORIZATION"),
        resolvedTransactionFlow: createResolvedTransactionFlow("AUTHORIZATION"),
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

    expect(result._unsafeUnwrap()).toMatchInlineSnapshot(`
        StripeWebhookSuccessResponse {
          "responseStatusCode": 200,
        }
      `);

    expect(mockEventReporter.reportTransactionEvent).toHaveBeenCalledOnce();

    expect(
      vi.mocked(mockEventReporter.reportTransactionEvent).mock.calls[0][0],
    ).toMatchInlineSnapshot(
      {
        time: expect.toSatisfy(
          (d) => new Date(d).getTime() === new Date(event.data.object.created * 1000).getTime(),
        ),
      },
      `
      {
        "actions": [
          "CHARGE",
        ],
        "amount": SaleorMoney {
          "amount": 10,
          "currency": "USD",
        },
        "externalReference": "https://dashboard.stripe.com/payments/pi_TEST_TEST_TEST",
        "message": "Payment intent succeeded",
        "pspReference": "pi_TEST_TEST_TEST",
        "time": toSatisfy<[Function anonymous]>,
        "transactionId": "mocked-transaction-id",
        "type": "AUTHORIZATION_SUCCESS",
      }
    `,
    );
  });
});
