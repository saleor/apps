import { APL } from "@saleor/app-sdk/APL";
import { ok } from "neverthrow";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { mockedAppConfigRepo } from "@/__tests__/mocks/app-config-repo";
import {
  mockAdyenWebhookUrl,
  mockedSaleorSchemaVersionNotSupportingPaymentMethodDetails,
  mockedSaleorSchemaVersionSupportingPaymentMethodDetails,
  mockedSaleorTransactionId,
} from "@/__tests__/mocks/constants";
import { mockAuthData } from "@/__tests__/mocks/mock-auth-data";
import { mockedStripePaymentIntentId } from "@/__tests__/mocks/mocked-stripe-payment-intent-id";
import { mockedStripePaymentIntentsApi } from "@/__tests__/mocks/mocked-stripe-payment-intents-api";
import {
  mockedStripeCardPaymentMethod,
  mockedStripeOtherPaymentMethod,
} from "@/__tests__/mocks/mocked-stripe-payment-method";
import { MockedTransactionRecorder } from "@/__tests__/mocks/mocked-transaction-recorder";
import { getMockedChargeRefundUpdatedEvent } from "@/__tests__/mocks/stripe-events/mocked-charge-refund-updated";
import { getMockedPaymentIntentAmountCapturableUpdatedEvent } from "@/__tests__/mocks/stripe-events/mocked-payment-intent-amount-capturable-updated";
import { getMockedPaymentIntentPaymentCanceledEvent } from "@/__tests__/mocks/stripe-events/mocked-payment-intent-canceled";
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
import { StripeWebhookManager } from "@/modules/stripe/stripe-webhook-manager";
import { IStripeEventVerify, IStripePaymentIntentsApiFactory } from "@/modules/stripe/types";
import { RecordedTransaction } from "@/modules/transactions-recording/domain/recorded-transaction";

import { StripeWebhookUseCase } from "./use-case";
import { WebhookParams } from "./webhook-params";

const mockApl = {
  get: vi.fn(),
  set: vi.fn(),
  delete: vi.fn(),
  getAll: vi.fn(),
} satisfies APL;

const eventVerify = {
  verifyEvent: vi.fn(),
} satisfies IStripeEventVerify;

const webhookParams = WebhookParams.createFromWebhookUrl(mockAdyenWebhookUrl)._unsafeUnwrap();

const mockEventReporter = {
  reportTransactionEvent: vi.fn(),
} satisfies ITransactionEventReporter;

let instance: StripeWebhookUseCase;

const mockTransactionRecorder = new MockedTransactionRecorder();

const stripePaymentIntentsApiFactory = {
  create: () => mockedStripePaymentIntentsApi,
} satisfies IStripePaymentIntentsApiFactory;

describe("StripeWebhookUseCase - handling payment_intent.success event", () => {
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

    vi.spyOn(mockedStripePaymentIntentsApi, "getPaymentIntent").mockImplementationOnce(async () =>
      ok({
        payment_method: mockedStripeCardPaymentMethod,
      }),
    );
  });

  it("Reports CHARGE_SUCCESS transaction event to Saleor when resolvedFlow is CHARGE", async () => {
    const event = getMockedPaymentIntentSucceededEvent();
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
        "message": "Ok",
        "statusCode": 200,
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
          "REFUND",
        ],
        "amount": SaleorMoney {
          "amount": 1.013,
          "currency": "IQD",
        },
        "externalUrl": "https://dashboard.stripe.com/payments/pi_TEST_TEST_TEST",
        "message": "Payment intent has been successful",
        "pspReference": "pi_TEST_TEST_TEST",
        "saleorPaymentMethodDetailsInput": {
          "card": {
            "brand": "visa",
            "expMonth": 12,
            "expYear": 2025,
            "lastDigits": "4242",
            "name": "Visa",
          },
        },
        "time": toSatisfy<[Function anonymous]>,
        "transactionId": "mocked-transaction-id",
        "type": "CHARGE_SUCCESS",
      }
    `,
    );
  });

  it("Reports CHARGE_SUCCESS transaction event to Saleor when resolvedFlow is AUTHORIZATION", async () => {
    const event = getMockedPaymentIntentSucceededEvent();
    const stripePiId = createStripePaymentIntentId(event.data.object.id);

    eventVerify.verifyEvent.mockImplementationOnce(() => ok(event));

    mockTransactionRecorder.transactions = {
      [stripePiId]: new RecordedTransaction({
        saleorTransactionId: mockedSaleorTransactionId,
        stripePaymentIntentId: stripePiId,
        saleorTransactionFlow: createSaleorTransactionFlow("AUTHORIZATION"),
        resolvedTransactionFlow: createResolvedTransactionFlow("AUTHORIZATION"),
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

    expect(result._unsafeUnwrap()).toMatchInlineSnapshot(`
      StripeWebhookSuccessResponse {
        "message": "Ok",
        "statusCode": 200,
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
          "REFUND",
        ],
        "amount": SaleorMoney {
          "amount": 1.013,
          "currency": "IQD",
        },
        "externalUrl": "https://dashboard.stripe.com/payments/pi_TEST_TEST_TEST",
        "message": "Payment intent has been successful",
        "pspReference": "pi_TEST_TEST_TEST",
        "saleorPaymentMethodDetailsInput": {
          "card": {
            "brand": "visa",
            "expMonth": 12,
            "expYear": 2025,
            "lastDigits": "4242",
            "name": "Visa",
          },
        },
        "time": toSatisfy<[Function anonymous]>,
        "transactionId": "mocked-transaction-id",
        "type": "CHARGE_SUCCESS",
      }
    `,
    );
  });
});

describe("StripeWebhookUseCase - handling payment_intent.amount_capturable_updated event", () => {
  beforeEach(() => {
    mockApl.get.mockImplementation(async () => mockAuthData);
    mockTransactionRecorder.reset();
    vi.spyOn(mockedStripePaymentIntentsApi, "getPaymentIntent").mockImplementationOnce(async () =>
      ok({
        payment_method: mockedStripeOtherPaymentMethod,
      }),
    );

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

  it("Reports AUTHORIZATION_SUCCESS transaction event", async () => {
    const event = getMockedPaymentIntentAmountCapturableUpdatedEvent();

    const stripePiId = createStripePaymentIntentId(event.data.object.id);

    eventVerify.verifyEvent.mockImplementationOnce(() => ok(event));

    mockTransactionRecorder.transactions = {
      [stripePiId]: new RecordedTransaction({
        saleorTransactionId: mockedSaleorTransactionId,
        stripePaymentIntentId: stripePiId,
        saleorTransactionFlow: createSaleorTransactionFlow("AUTHORIZATION"),
        resolvedTransactionFlow: createResolvedTransactionFlow("AUTHORIZATION"),
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

    expect(result._unsafeUnwrap()).toMatchInlineSnapshot(`
      StripeWebhookSuccessResponse {
        "message": "Ok",
        "statusCode": 200,
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
          "CANCEL",
        ],
        "amount": SaleorMoney {
          "amount": 10,
          "currency": "USD",
        },
        "externalUrl": "https://dashboard.stripe.com/payments/pi_TEST_TEST_TEST",
        "message": "Payment intent has been successful",
        "pspReference": "pi_TEST_TEST_TEST",
        "saleorPaymentMethodDetailsInput": {
          "other": {
            "name": "sepa_debit",
          },
        },
        "time": toSatisfy<[Function anonymous]>,
        "transactionId": "mocked-transaction-id",
        "type": "AUTHORIZATION_SUCCESS",
      }
    `,
    );
  });
});

describe("StripeWebhookUseCase - handling payment_intent.payment_failed event", () => {
  beforeEach(() => {
    mockApl.get.mockImplementation(async () => mockAuthData);
    mockTransactionRecorder.reset();

    vi.spyOn(mockedStripePaymentIntentsApi, "getPaymentIntent").mockImplementationOnce(async () =>
      ok({
        payment_method: null,
      }),
    );

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

  it("Reports CHARGE_FAILED transaction event to Saleor when resolvedFlow in CHARGE", async () => {
    const event = getMockedPaymentIntentPaymentFailedEvent();
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
        "message": "Ok",
        "statusCode": 200,
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
        "externalUrl": "https://dashboard.stripe.com/payments/pi_TEST_TEST_TEST",
        "message": "Payment intent failed",
        "pspReference": "pi_TEST_TEST_TEST",
        "saleorPaymentMethodDetailsInput": null,
        "time": toSatisfy<[Function anonymous]>,
        "transactionId": "mocked-transaction-id",
        "type": "CHARGE_FAILURE",
      }
    `,
    );
  });

  it("Reports AUTHORIZATION_FAILED transaction event to Saleor when resolvedFlow in AUTHORIZATION", async () => {
    const event = getMockedPaymentIntentPaymentFailedEvent();
    const stripePiId = createStripePaymentIntentId(event.data.object.id);

    eventVerify.verifyEvent.mockImplementationOnce(() => ok(event));

    mockTransactionRecorder.transactions = {
      [stripePiId]: new RecordedTransaction({
        saleorTransactionId: mockedSaleorTransactionId,
        stripePaymentIntentId: stripePiId,
        saleorTransactionFlow: createSaleorTransactionFlow("AUTHORIZATION"),
        resolvedTransactionFlow: createResolvedTransactionFlow("AUTHORIZATION"),
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

    expect(result._unsafeUnwrap()).toMatchInlineSnapshot(`
      StripeWebhookSuccessResponse {
        "message": "Ok",
        "statusCode": 200,
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
          "CANCEL",
        ],
        "amount": SaleorMoney {
          "amount": 10,
          "currency": "USD",
        },
        "externalUrl": "https://dashboard.stripe.com/payments/pi_TEST_TEST_TEST",
        "message": "Payment intent failed",
        "pspReference": "pi_TEST_TEST_TEST",
        "saleorPaymentMethodDetailsInput": null,
        "time": toSatisfy<[Function anonymous]>,
        "transactionId": "mocked-transaction-id",
        "type": "AUTHORIZATION_FAILURE",
      }
    `,
    );
  });
});

describe("StripeWebhookUseCase - handling payment_intent.processing event", () => {
  beforeEach(() => {
    mockApl.get.mockImplementation(async () => mockAuthData);
    mockTransactionRecorder.reset();
    vi.spyOn(mockedStripePaymentIntentsApi, "getPaymentIntent").mockImplementationOnce(async () =>
      ok({
        payment_method: mockedStripeCardPaymentMethod,
      }),
    );

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

  it("Report CHARGE_REQUEST transaction event to Saleor when resolved flow is CHARGE", async () => {
    const event = getMockedPaymentIntentProcessingEvent();
    const stripePiId = createStripePaymentIntentId(event.data.object.id);

    eventVerify.verifyEvent.mockImplementationOnce(() => ok(event));

    mockTransactionRecorder.transactions = {
      [stripePiId]: new RecordedTransaction({
        saleorTransactionId: mockedSaleorTransactionId,
        stripePaymentIntentId: stripePiId,
        saleorTransactionFlow: createSaleorTransactionFlow("CHARGE"),
        resolvedTransactionFlow: createResolvedTransactionFlow("CHARGE"),
        selectedPaymentMethod: "card",
        saleorSchemaVersion: mockedSaleorSchemaVersionNotSupportingPaymentMethodDetails,
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
        "message": "Ok",
        "statusCode": 200,
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
          "amount": 1013,
          "currency": "JPY",
        },
        "externalUrl": "https://dashboard.stripe.com/payments/pi_TEST_TEST_TEST",
        "message": "Payment intent is processing",
        "pspReference": "pi_TEST_TEST_TEST",
        "saleorPaymentMethodDetailsInput": null,
        "time": toSatisfy<[Function anonymous]>,
        "transactionId": "mocked-transaction-id",
        "type": "CHARGE_REQUEST",
      }
    `,
    );
  });

  it("Report AUTHORIZATION_REQUEST transaction event to Saleor when resolved flow is AUTHORIZATION", async () => {
    const event = getMockedPaymentIntentProcessingEvent();
    const stripePiId = createStripePaymentIntentId(event.data.object.id);

    eventVerify.verifyEvent.mockImplementationOnce(() => ok(event));

    mockTransactionRecorder.transactions = {
      [stripePiId]: new RecordedTransaction({
        saleorTransactionId: mockedSaleorTransactionId,
        stripePaymentIntentId: stripePiId,
        saleorTransactionFlow: createSaleorTransactionFlow("AUTHORIZATION"),
        resolvedTransactionFlow: createResolvedTransactionFlow("AUTHORIZATION"),
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

    expect(result._unsafeUnwrap()).toMatchInlineSnapshot(`
      StripeWebhookSuccessResponse {
        "message": "Ok",
        "statusCode": 200,
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
          "amount": 1013,
          "currency": "JPY",
        },
        "externalUrl": "https://dashboard.stripe.com/payments/pi_TEST_TEST_TEST",
        "message": "Payment intent is processing",
        "pspReference": "pi_TEST_TEST_TEST",
        "saleorPaymentMethodDetailsInput": {
          "card": {
            "brand": "visa",
            "expMonth": 12,
            "expYear": 2025,
            "lastDigits": "4242",
            "name": "Visa",
          },
        },
        "time": toSatisfy<[Function anonymous]>,
        "transactionId": "mocked-transaction-id",
        "type": "AUTHORIZATION_REQUEST",
      }
    `,
    );
  });
});

describe("StripeWebhookUseCase - handling payment_intent.requires_action event", () => {
  beforeEach(() => {
    mockApl.get.mockImplementation(async () => mockAuthData);
    mockTransactionRecorder.reset();
    vi.spyOn(mockedStripePaymentIntentsApi, "getPaymentIntent").mockImplementationOnce(async () =>
      ok({
        payment_method: mockedStripeCardPaymentMethod,
      }),
    );

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

  it("Reports CHARGE_ACTION_REQUIRED transaction event to Saleor when resolved flow is CHARGE", async () => {
    const event = getMockedPaymentIntentRequiresActionEvent();
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
        "message": "Ok",
        "statusCode": 200,
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
          "CANCEL",
        ],
        "amount": SaleorMoney {
          "amount": 0.1,
          "currency": "UYW",
        },
        "externalUrl": "https://dashboard.stripe.com/payments/pi_TEST_TEST_TEST",
        "message": "Payment intent requires action",
        "pspReference": "pi_TEST_TEST_TEST",
        "saleorPaymentMethodDetailsInput": {
          "card": {
            "brand": "visa",
            "expMonth": 12,
            "expYear": 2025,
            "lastDigits": "4242",
            "name": "Visa",
          },
        },
        "time": toSatisfy<[Function anonymous]>,
        "transactionId": "mocked-transaction-id",
        "type": "CHARGE_ACTION_REQUIRED",
      }
    `,
    );
  });

  it("Reports AUTHORIZATION_ACTION_REQUIRED transaction event to Saleor when resolved flow in AUTHORIZATION", async () => {
    const event = getMockedPaymentIntentRequiresActionEvent();
    const stripePiId = createStripePaymentIntentId(event.data.object.id);

    eventVerify.verifyEvent.mockImplementationOnce(() => ok(event));

    mockTransactionRecorder.transactions = {
      [stripePiId]: new RecordedTransaction({
        saleorTransactionId: mockedSaleorTransactionId,
        stripePaymentIntentId: stripePiId,
        saleorTransactionFlow: createSaleorTransactionFlow("AUTHORIZATION"),
        resolvedTransactionFlow: createResolvedTransactionFlow("AUTHORIZATION"),
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

    expect(result._unsafeUnwrap()).toMatchInlineSnapshot(`
      StripeWebhookSuccessResponse {
        "message": "Ok",
        "statusCode": 200,
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
          "CANCEL",
        ],
        "amount": SaleorMoney {
          "amount": 0.1,
          "currency": "UYW",
        },
        "externalUrl": "https://dashboard.stripe.com/payments/pi_TEST_TEST_TEST",
        "message": "Payment intent requires action",
        "pspReference": "pi_TEST_TEST_TEST",
        "saleorPaymentMethodDetailsInput": {
          "card": {
            "brand": "visa",
            "expMonth": 12,
            "expYear": 2025,
            "lastDigits": "4242",
            "name": "Visa",
          },
        },
        "time": toSatisfy<[Function anonymous]>,
        "transactionId": "mocked-transaction-id",
        "type": "AUTHORIZATION_ACTION_REQUIRED",
      }
    `,
    );
  });
});

describe("StripeWebhookUseCase - handling payment_intent.canceled event", () => {
  beforeEach(() => {
    mockApl.get.mockImplementation(async () => mockAuthData);
    mockTransactionRecorder.reset();
    vi.spyOn(mockedStripePaymentIntentsApi, "getPaymentIntent").mockImplementationOnce(async () =>
      ok({
        payment_method: mockedStripeCardPaymentMethod,
      }),
    );

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

  it("Reports CANCEL_SUCCESS transaction event to Saleor and resolvedFlow is CHARGE", async () => {
    const event = getMockedPaymentIntentPaymentCanceledEvent();
    const stripePiId = createStripePaymentIntentId(event.data.object.id);

    eventVerify.verifyEvent.mockImplementationOnce(() => ok(event));

    mockTransactionRecorder.transactions = {
      [stripePiId]: new RecordedTransaction({
        saleorTransactionId: mockedSaleorTransactionId,
        stripePaymentIntentId: stripePiId,
        saleorTransactionFlow: createSaleorTransactionFlow("CHARGE"),
        resolvedTransactionFlow: createResolvedTransactionFlow("CHARGE"),
        selectedPaymentMethod: "card",
        saleorSchemaVersion: mockedSaleorSchemaVersionNotSupportingPaymentMethodDetails,
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
        "message": "Ok",
        "statusCode": 200,
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
          "amount": 10,
          "currency": "USD",
        },
        "externalUrl": "https://dashboard.stripe.com/payments/pi_TEST_TEST_TEST",
        "message": "Payment intent was cancelled",
        "pspReference": "pi_TEST_TEST_TEST",
        "saleorPaymentMethodDetailsInput": null,
        "time": toSatisfy<[Function anonymous]>,
        "transactionId": "mocked-transaction-id",
        "type": "CANCEL_SUCCESS",
      }
    `,
    );
  });

  it("Reports CANCEL_SUCCESS transaction event to Saleor and resolvedFlow is AUTHORIZATION", async () => {
    const event = getMockedPaymentIntentPaymentCanceledEvent();
    const stripePiId = createStripePaymentIntentId(event.data.object.id);

    eventVerify.verifyEvent.mockImplementationOnce(() => ok(event));

    mockTransactionRecorder.transactions = {
      [stripePiId]: new RecordedTransaction({
        saleorTransactionId: mockedSaleorTransactionId,
        stripePaymentIntentId: stripePiId,
        saleorTransactionFlow: createSaleorTransactionFlow("AUTHORIZATION"),
        resolvedTransactionFlow: createResolvedTransactionFlow("AUTHORIZATION"),
        selectedPaymentMethod: "card",
        saleorSchemaVersion: mockedSaleorSchemaVersionNotSupportingPaymentMethodDetails,
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
        "message": "Ok",
        "statusCode": 200,
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
          "amount": 10,
          "currency": "USD",
        },
        "externalUrl": "https://dashboard.stripe.com/payments/pi_TEST_TEST_TEST",
        "message": "Payment intent was cancelled",
        "pspReference": "pi_TEST_TEST_TEST",
        "saleorPaymentMethodDetailsInput": null,
        "time": toSatisfy<[Function anonymous]>,
        "transactionId": "mocked-transaction-id",
        "type": "CANCEL_SUCCESS",
      }
    `,
    );
  });
});

describe("StripeWebhookUseCase - handling charge.refund.updated event", () => {
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

  it("Reports REFUND_SUCCESS transaction event when refund has status: success", async () => {
    const event = getMockedChargeRefundUpdatedEvent();

    eventVerify.verifyEvent.mockImplementationOnce(() => ok(event));

    mockTransactionRecorder.transactions = {
      [mockedStripePaymentIntentId]: new RecordedTransaction({
        saleorTransactionId: mockedSaleorTransactionId,
        stripePaymentIntentId: mockedStripePaymentIntentId,
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

    expect(result._unsafeUnwrap()).toMatchInlineSnapshot(`
      StripeWebhookSuccessResponse {
        "message": "Ok",
        "statusCode": 200,
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
          "REFUND",
        ],
        "amount": SaleorMoney {
          "amount": 10,
          "currency": "USD",
        },
        "externalUrl": "https://dashboard.stripe.com/refunds/re_TEST_TEST_TEST",
        "message": "Refund was successful",
        "pspReference": "re_TEST_TEST_TEST",
        "saleorPaymentMethodDetailsInput": null,
        "time": toSatisfy<[Function anonymous]>,
        "transactionId": "mocked-transaction-id",
        "type": "REFUND_SUCCESS",
      }
    `,
    );
  });

  it("Reports REFUND_FAILURE transaction event when refund has status: failed", async () => {
    const event = getMockedChargeRefundUpdatedEvent({
      status: "failed",
    });

    eventVerify.verifyEvent.mockImplementationOnce(() => ok(event));

    mockTransactionRecorder.transactions = {
      [mockedStripePaymentIntentId]: new RecordedTransaction({
        saleorTransactionId: mockedSaleorTransactionId,
        stripePaymentIntentId: mockedStripePaymentIntentId,
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

    expect(result._unsafeUnwrap()).toMatchInlineSnapshot(`
      StripeWebhookSuccessResponse {
        "message": "Ok",
        "statusCode": 200,
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
          "REFUND",
        ],
        "amount": SaleorMoney {
          "amount": 10,
          "currency": "USD",
        },
        "externalUrl": "https://dashboard.stripe.com/refunds/re_TEST_TEST_TEST",
        "message": "Refund failed",
        "pspReference": "re_TEST_TEST_TEST",
        "saleorPaymentMethodDetailsInput": null,
        "time": toSatisfy<[Function anonymous]>,
        "transactionId": "mocked-transaction-id",
        "type": "REFUND_FAILURE",
      }
    `,
    );
  });

  it("Reports REFUND_REQUEST transaction event when refund has status: pending", async () => {
    const event = getMockedChargeRefundUpdatedEvent({
      status: "pending",
    });

    eventVerify.verifyEvent.mockImplementationOnce(() => ok(event));

    mockTransactionRecorder.transactions = {
      [mockedStripePaymentIntentId]: new RecordedTransaction({
        saleorTransactionId: mockedSaleorTransactionId,
        stripePaymentIntentId: mockedStripePaymentIntentId,
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

    expect(result._unsafeUnwrap()).toMatchInlineSnapshot(`
      StripeWebhookSuccessResponse {
        "message": "Ok",
        "statusCode": 200,
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
          "amount": 10,
          "currency": "USD",
        },
        "externalUrl": "https://dashboard.stripe.com/refunds/re_TEST_TEST_TEST",
        "message": "Refund is processing",
        "pspReference": "re_TEST_TEST_TEST",
        "saleorPaymentMethodDetailsInput": null,
        "time": toSatisfy<[Function anonymous]>,
        "transactionId": "mocked-transaction-id",
        "type": "REFUND_REQUEST",
      }
    `,
    );
  });
});

describe("StripeWebhookUseCase - handling events without metadata created by Saleor", () => {
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

  it("Returns 200 to Stripe if metadata is missing for payment_intent.succeeded event", async () => {
    const event = getMockedPaymentIntentSucceededEvent();

    event.data.object.metadata = {};

    eventVerify.verifyEvent.mockImplementationOnce(() => ok(event));

    const result = await instance.execute({
      rawBody: "TEST BODY",
      signatureHeader: "SIGNATURE",
      webhookParams: webhookParams,
    });

    expect(result._unsafeUnwrap()).toMatchInlineSnapshot(`
      StripeWebhookUnrecognizedEventResponse {
        "message": "Event not managed by this Saleor app - ignored",
        "statusCode": 200,
      }
    `);

    expect(mockEventReporter.reportTransactionEvent).not.toHaveBeenCalled();
  });

  it("Returns 200 to Stripe if metadata is missing for charge.refund.updated event", async () => {
    const event = getMockedChargeRefundUpdatedEvent();

    event.data.object.metadata = {};

    eventVerify.verifyEvent.mockImplementationOnce(() => ok(event));

    const result = await instance.execute({
      rawBody: "TEST BODY",
      signatureHeader: "SIGNATURE",
      webhookParams: webhookParams,
    });

    expect(result._unsafeUnwrap()).toMatchInlineSnapshot(`
      StripeWebhookUnrecognizedEventResponse {
        "message": "Event not managed by this Saleor app - ignored",
        "statusCode": 200,
      }
    `);

    expect(mockEventReporter.reportTransactionEvent).not.toHaveBeenCalled();
  });

  it("Returns 500 to Stripe if metadata has saleor_source_id but missing saleor_transaction_id for payment_intent.succeeded event", async () => {
    const event = getMockedPaymentIntentSucceededEvent();

    // Partially-tagged: has some Saleor metadata but missing transaction ID
    event.data.object.metadata = {
      saleor_source_id: "some-checkout-id",
      saleor_source_type: "Checkout",
    };

    eventVerify.verifyEvent.mockImplementationOnce(() => ok(event));

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

    expect(mockEventReporter.reportTransactionEvent).not.toHaveBeenCalled();
  });

  it("Returns 500 to Stripe if metadata has saleor_source_id but missing saleor_transaction_id for charge.refund.updated event", async () => {
    const event = getMockedChargeRefundUpdatedEvent();

    // Partially-tagged: has some Saleor metadata but missing transaction ID
    event.data.object.metadata = {
      saleor_source_id: "some-checkout-id",
      saleor_source_type: "Checkout",
    };

    eventVerify.verifyEvent.mockImplementationOnce(() => ok(event));

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

    expect(mockEventReporter.reportTransactionEvent).not.toHaveBeenCalled();
  });
});
