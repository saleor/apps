import { describe, expect, it } from "vitest";

import { getMockedSaleorMoney, mockedSaleorTransactionId } from "@/__tests__/mocks/constants";
import { getMockedPaymentIntentDashboardUrl } from "@/__tests__/mocks/mocked-payment-intent-dashboard-url";
import { getMockedRefundDashboardUrl } from "@/__tests__/mocks/mocked-refund-dashboard-url";
import { mockedStripePaymentIntentId } from "@/__tests__/mocks/mocked-stripe-payment-intent-id";
import { mockedStripeRefundId } from "@/__tests__/mocks/mocked-stripe-refund-id";
import { createStripePaymentIntentStatus } from "@/modules/stripe/stripe-payment-intent-status";
import {
  AuthorizationActionRequiredResult,
  ChargeActionRequiredResult,
} from "@/modules/transaction-result/action-required-result";
import {
  AuthorizationFailureResult,
  ChargeFailureResult,
} from "@/modules/transaction-result/failure-result";
import {
  RefundFailureResult,
  RefundRequestResult,
  RefundSuccessResult,
} from "@/modules/transaction-result/refund-result";
import {
  AuthorizationRequestResult,
  ChargeRequestResult,
} from "@/modules/transaction-result/request-result";
import {
  AuthorizationSuccessResult,
  ChargeSuccessResult,
} from "@/modules/transaction-result/success-result";

import { TransactionEventReportVariablesResolver } from "./transaction-event-report-variables-resolver";

describe("TransactionEventReportVariablesResolver", () => {
  it("Resolves valid transaction report variables for transactionResult: ChargeSuccess", () => {
    const transactionResult = new ChargeSuccessResult();

    const resolver = new TransactionEventReportVariablesResolver({
      saleorMoney: getMockedSaleorMoney(),
      transactionResult,
      stripeObjectId: mockedStripePaymentIntentId,
      externalUrl: getMockedPaymentIntentDashboardUrl({
        stripeEnv: "LIVE",
      }),
      saleorTransactionId: mockedSaleorTransactionId,
      timestamp: new Date("2023-10-01T00:00:00Z"),
      paymentMethodDetails: null,
    });

    expect(resolver.resolveEventReportVariables()).toMatchInlineSnapshot(`
      {
        "actions": [
          "REFUND",
        ],
        "amount": SaleorMoney {
          "amount": 10,
          "currency": "USD",
        },
        "externalUrl": "https://dashboard.stripe.com/payments/pi_TEST_TEST_TEST",
        "message": "Payment intent has been successful",
        "pspReference": "pi_TEST_TEST_TEST",
        "saleorPaymentMethodDetailsInput": null,
        "time": "2023-10-01T00:00:00.000Z",
        "transactionId": "mocked-transaction-id",
        "type": "CHARGE_SUCCESS",
      }
    `);
  });

  it("Resolves valid transaction report variables for transactionResult: AuthorizationSuccess", () => {
    const transactionResult = new AuthorizationSuccessResult();

    const resolver = new TransactionEventReportVariablesResolver({
      transactionResult,
      stripeObjectId: mockedStripePaymentIntentId,
      saleorMoney: getMockedSaleorMoney(),
      externalUrl: getMockedPaymentIntentDashboardUrl({
        stripeEnv: "LIVE",
      }),
      saleorTransactionId: mockedSaleorTransactionId,
      timestamp: new Date("2023-10-01T00:00:00Z"),
      paymentMethodDetails: null,
    });

    expect(resolver.resolveEventReportVariables()).toMatchInlineSnapshot(`
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
        "saleorPaymentMethodDetailsInput": null,
        "time": "2023-10-01T00:00:00.000Z",
        "transactionId": "mocked-transaction-id",
        "type": "AUTHORIZATION_SUCCESS",
      }
    `);
  });

  it("Resolves valid transaction report variables for transactionResult: ChargeActionRequired", () => {
    const transactionResult = new ChargeActionRequiredResult(
      createStripePaymentIntentStatus("requires_action"),
    );

    const resolver = new TransactionEventReportVariablesResolver({
      stripeObjectId: mockedStripePaymentIntentId,
      externalUrl: getMockedPaymentIntentDashboardUrl({
        stripeEnv: "LIVE",
      }),
      saleorMoney: getMockedSaleorMoney(),
      transactionResult,
      saleorTransactionId: mockedSaleorTransactionId,
      timestamp: new Date("2023-10-01T00:00:00Z"),
      paymentMethodDetails: null,
    });

    expect(resolver.resolveEventReportVariables()).toMatchInlineSnapshot(`
      {
        "actions": [
          "CANCEL",
        ],
        "amount": SaleorMoney {
          "amount": 10,
          "currency": "USD",
        },
        "externalUrl": "https://dashboard.stripe.com/payments/pi_TEST_TEST_TEST",
        "message": "Payment intent requires action",
        "pspReference": "pi_TEST_TEST_TEST",
        "saleorPaymentMethodDetailsInput": null,
        "time": "2023-10-01T00:00:00.000Z",
        "transactionId": "mocked-transaction-id",
        "type": "CHARGE_ACTION_REQUIRED",
      }
    `);
  });

  it("Resolves valid transaction report variables for transactionResult: AuthorizationActionRequired", () => {
    const transactionResult = new AuthorizationActionRequiredResult(
      createStripePaymentIntentStatus("requires_action"),
    );

    const resolver = new TransactionEventReportVariablesResolver({
      saleorMoney: getMockedSaleorMoney(),
      stripeObjectId: mockedStripePaymentIntentId,
      externalUrl: getMockedPaymentIntentDashboardUrl({
        stripeEnv: "LIVE",
      }),
      transactionResult,
      saleorTransactionId: mockedSaleorTransactionId,
      timestamp: new Date("2023-10-01T00:00:00Z"),
      paymentMethodDetails: null,
    });

    expect(resolver.resolveEventReportVariables()).toMatchInlineSnapshot(`
      {
        "actions": [
          "CANCEL",
        ],
        "amount": SaleorMoney {
          "amount": 10,
          "currency": "USD",
        },
        "externalUrl": "https://dashboard.stripe.com/payments/pi_TEST_TEST_TEST",
        "message": "Payment intent requires action",
        "pspReference": "pi_TEST_TEST_TEST",
        "saleorPaymentMethodDetailsInput": null,
        "time": "2023-10-01T00:00:00.000Z",
        "transactionId": "mocked-transaction-id",
        "type": "AUTHORIZATION_ACTION_REQUIRED",
      }
    `);
  });

  it("Resolves valid transaction report variables for transactionResult: ChargeRequest", () => {
    const transactionResult = new ChargeRequestResult();

    const resolver = new TransactionEventReportVariablesResolver({
      saleorMoney: getMockedSaleorMoney(),
      stripeObjectId: mockedStripePaymentIntentId,
      externalUrl: getMockedPaymentIntentDashboardUrl(),
      transactionResult,
      saleorTransactionId: mockedSaleorTransactionId,
      timestamp: new Date("2023-10-01T00:00:00Z"),
      paymentMethodDetails: null,
    });

    expect(resolver.resolveEventReportVariables()).toMatchInlineSnapshot(`
      {
        "actions": [],
        "amount": SaleorMoney {
          "amount": 10,
          "currency": "USD",
        },
        "externalUrl": "https://dashboard.stripe.com/test/payments/pi_TEST_TEST_TEST",
        "message": "Payment intent is processing",
        "pspReference": "pi_TEST_TEST_TEST",
        "saleorPaymentMethodDetailsInput": null,
        "time": "2023-10-01T00:00:00.000Z",
        "transactionId": "mocked-transaction-id",
        "type": "CHARGE_REQUEST",
      }
    `);
  });

  it("Resolves valid transaction report variables for transactionResult: AuthorizationRequest", () => {
    const transactionResult = new AuthorizationRequestResult();

    const resolver = new TransactionEventReportVariablesResolver({
      saleorMoney: getMockedSaleorMoney(),
      stripeObjectId: mockedStripePaymentIntentId,
      externalUrl: getMockedPaymentIntentDashboardUrl(),
      transactionResult,
      saleorTransactionId: mockedSaleorTransactionId,
      timestamp: new Date("2023-10-01T00:00:00Z"),
      paymentMethodDetails: null,
    });

    expect(resolver.resolveEventReportVariables()).toMatchInlineSnapshot(`
      {
        "actions": [],
        "amount": SaleorMoney {
          "amount": 10,
          "currency": "USD",
        },
        "externalUrl": "https://dashboard.stripe.com/test/payments/pi_TEST_TEST_TEST",
        "message": "Payment intent is processing",
        "pspReference": "pi_TEST_TEST_TEST",
        "saleorPaymentMethodDetailsInput": null,
        "time": "2023-10-01T00:00:00.000Z",
        "transactionId": "mocked-transaction-id",
        "type": "AUTHORIZATION_REQUEST",
      }
    `);
  });

  it("Resolves valid transaction report variables for transactionResult: ChargeFailureResult", () => {
    const transactionResult = new ChargeFailureResult();

    const resolver = new TransactionEventReportVariablesResolver({
      saleorMoney: getMockedSaleorMoney(),
      stripeObjectId: mockedStripePaymentIntentId,
      externalUrl: getMockedPaymentIntentDashboardUrl({
        stripeEnv: "LIVE",
      }),
      transactionResult,
      saleorTransactionId: mockedSaleorTransactionId,
      timestamp: new Date("2023-10-01T00:00:00Z"),
      paymentMethodDetails: null,
    });

    expect(resolver.resolveEventReportVariables()).toMatchInlineSnapshot(`
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
        "time": "2023-10-01T00:00:00.000Z",
        "transactionId": "mocked-transaction-id",
        "type": "CHARGE_FAILURE",
      }
    `);
  });

  it("Resolves valid transaction report variables for transactionResult: AuthorizationFailure", () => {
    const transactionResult = new AuthorizationFailureResult();

    const resolver = new TransactionEventReportVariablesResolver({
      transactionResult,
      stripeObjectId: mockedStripePaymentIntentId,
      externalUrl: getMockedPaymentIntentDashboardUrl({
        stripeEnv: "LIVE",
      }),
      saleorMoney: getMockedSaleorMoney(),
      saleorTransactionId: mockedSaleorTransactionId,
      timestamp: new Date("2023-10-01T00:00:00Z"),
      paymentMethodDetails: null,
    });

    expect(resolver.resolveEventReportVariables()).toMatchInlineSnapshot(`
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
        "time": "2023-10-01T00:00:00.000Z",
        "transactionId": "mocked-transaction-id",
        "type": "AUTHORIZATION_FAILURE",
      }
    `);
  });

  it("Resolves valid transaction report variables for transactionResult: RefundSuccess", () => {
    const transactionResult = new RefundSuccessResult();

    const resolver = new TransactionEventReportVariablesResolver({
      transactionResult,
      stripeObjectId: mockedStripeRefundId,
      externalUrl: getMockedRefundDashboardUrl(),
      saleorMoney: getMockedSaleorMoney(),
      saleorTransactionId: mockedSaleorTransactionId,
      timestamp: new Date("2023-10-01T00:00:00Z"),
      paymentMethodDetails: null,
    });

    expect(resolver.resolveEventReportVariables()).toMatchInlineSnapshot(`
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
        "time": "2023-10-01T00:00:00.000Z",
        "transactionId": "mocked-transaction-id",
        "type": "REFUND_SUCCESS",
      }
    `);
  });

  it("Resolves valid transaction report variables for transactionResult: RefundFailure", () => {
    const transactionResult = new RefundFailureResult();

    const resolver = new TransactionEventReportVariablesResolver({
      transactionResult,
      stripeObjectId: mockedStripeRefundId,
      externalUrl: getMockedRefundDashboardUrl(),
      saleorMoney: getMockedSaleorMoney(),
      saleorTransactionId: mockedSaleorTransactionId,
      timestamp: new Date("2023-10-01T00:00:00Z"),
      paymentMethodDetails: null,
    });

    expect(resolver.resolveEventReportVariables()).toMatchInlineSnapshot(`
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
        "time": "2023-10-01T00:00:00.000Z",
        "transactionId": "mocked-transaction-id",
        "type": "REFUND_FAILURE",
      }
    `);
  });

  it("Resolves valid transaction report variables for transactionResult: RefundRequest", () => {
    const transactionResult = new RefundRequestResult();

    const resolver = new TransactionEventReportVariablesResolver({
      transactionResult,
      stripeObjectId: mockedStripeRefundId,
      externalUrl: getMockedRefundDashboardUrl(),
      saleorMoney: getMockedSaleorMoney(),
      saleorTransactionId: mockedSaleorTransactionId,
      timestamp: new Date("2023-10-01T00:00:00Z"),
      paymentMethodDetails: null,
    });

    expect(resolver.resolveEventReportVariables()).toMatchInlineSnapshot(`
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
        "time": "2023-10-01T00:00:00.000Z",
        "transactionId": "mocked-transaction-id",
        "type": "REFUND_REQUEST",
      }
    `);
  });
});
