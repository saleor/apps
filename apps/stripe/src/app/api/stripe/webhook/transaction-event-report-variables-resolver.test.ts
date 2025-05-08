import { describe, expect, it } from "vitest";

import {
  getMockedSaleorMoney,
  mockedSaleorTransactionIdBranded,
} from "@/__tests__/mocks/constants";
import { mockedStripePaymentIntentId } from "@/__tests__/mocks/mocked-stripe-payment-intent-id";
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
    const transactionResult = new ChargeSuccessResult({
      stripePaymentIntentId: mockedStripePaymentIntentId,
      stripeEnv: "LIVE",
    });

    const resolver = new TransactionEventReportVariablesResolver({
      saleorMoney: getMockedSaleorMoney(),
      transactionResult,
      saleorTransactionId: mockedSaleorTransactionIdBranded,
      date: new Date("2023-10-01T00:00:00Z"),
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
        "externalReference": "https://dashboard.stripe.com/payments/pi_TEST_TEST_TEST",
        "message": "Payment intent succeeded",
        "pspReference": "pi_TEST_TEST_TEST",
        "time": "2023-10-01T00:00:00.000Z",
        "transactionId": "mocked-transaction-id",
        "type": "CHARGE_SUCCESS",
      }
    `);
  });

  it("Resolves valid transaction report variables for transactionResult: AuthorizationSuccess", () => {
    const transactionResult = new AuthorizationSuccessResult({
      stripePaymentIntentId: mockedStripePaymentIntentId,
      stripeEnv: "LIVE",
    });

    const resolver = new TransactionEventReportVariablesResolver({
      transactionResult,
      saleorMoney: getMockedSaleorMoney(),
      saleorTransactionId: mockedSaleorTransactionIdBranded,
      date: new Date("2023-10-01T00:00:00Z"),
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
        "externalReference": "https://dashboard.stripe.com/payments/pi_TEST_TEST_TEST",
        "message": "Payment intent succeeded",
        "pspReference": "pi_TEST_TEST_TEST",
        "time": "2023-10-01T00:00:00.000Z",
        "transactionId": "mocked-transaction-id",
        "type": "AUTHORIZATION_SUCCESS",
      }
    `);
  });

  it("Resolves valid transaction report variables for transactionResult: ChargeActionRequired", () => {
    const transactionResult = new ChargeActionRequiredResult({
      stripePaymentIntentId: mockedStripePaymentIntentId,
      stripeStatus: createStripePaymentIntentStatus("requires_action")._unsafeUnwrap(),
      stripeEnv: "LIVE",
    });

    const resolver = new TransactionEventReportVariablesResolver({
      saleorMoney: getMockedSaleorMoney(),
      transactionResult,
      saleorTransactionId: mockedSaleorTransactionIdBranded,
      date: new Date("2023-10-01T00:00:00Z"),
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
        "externalReference": "https://dashboard.stripe.com/payments/pi_TEST_TEST_TEST",
        "message": "Payment intent requires action",
        "pspReference": "pi_TEST_TEST_TEST",
        "time": "2023-10-01T00:00:00.000Z",
        "transactionId": "mocked-transaction-id",
        "type": "CHARGE_ACTION_REQUIRED",
      }
    `);
  });

  it("Resolves valid transaction report variables for transactionResult: AuthorizationActionRequired", () => {
    const transactionResult = new AuthorizationActionRequiredResult({
      stripePaymentIntentId: mockedStripePaymentIntentId,
      stripeStatus: createStripePaymentIntentStatus("requires_action")._unsafeUnwrap(),
      stripeEnv: "LIVE",
    });

    const resolver = new TransactionEventReportVariablesResolver({
      saleorMoney: getMockedSaleorMoney(),
      transactionResult,
      saleorTransactionId: mockedSaleorTransactionIdBranded,
      date: new Date("2023-10-01T00:00:00Z"),
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
        "externalReference": "https://dashboard.stripe.com/payments/pi_TEST_TEST_TEST",
        "message": "Payment intent requires action",
        "pspReference": "pi_TEST_TEST_TEST",
        "time": "2023-10-01T00:00:00.000Z",
        "transactionId": "mocked-transaction-id",
        "type": "AUTHORIZATION_ACTION_REQUIRED",
      }
    `);
  });

  it("Resolves valid transaction report variables for transactionResult: ChargeRequest", () => {
    const transactionResult = new ChargeRequestResult({
      stripePaymentIntentId: mockedStripePaymentIntentId,
      stripeEnv: "TEST",
    });

    const resolver = new TransactionEventReportVariablesResolver({
      saleorMoney: getMockedSaleorMoney(),
      transactionResult,
      saleorTransactionId: mockedSaleorTransactionIdBranded,
      date: new Date("2023-10-01T00:00:00Z"),
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
        "externalReference": "https://dashboard.stripe.com/test/payments/pi_TEST_TEST_TEST",
        "message": "Payment intent is processing",
        "pspReference": "pi_TEST_TEST_TEST",
        "time": "2023-10-01T00:00:00.000Z",
        "transactionId": "mocked-transaction-id",
        "type": "CHARGE_REQUEST",
      }
    `);
  });

  it("Resolves valid transaction report variables for transactionResult: AuthorizationRequest", () => {
    const transactionResult = new AuthorizationRequestResult({
      stripePaymentIntentId: mockedStripePaymentIntentId,
      stripeEnv: "TEST",
    });

    const resolver = new TransactionEventReportVariablesResolver({
      saleorMoney: getMockedSaleorMoney(),
      transactionResult,
      saleorTransactionId: mockedSaleorTransactionIdBranded,
      date: new Date("2023-10-01T00:00:00Z"),
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
        "externalReference": "https://dashboard.stripe.com/test/payments/pi_TEST_TEST_TEST",
        "message": "Payment intent is processing",
        "pspReference": "pi_TEST_TEST_TEST",
        "time": "2023-10-01T00:00:00.000Z",
        "transactionId": "mocked-transaction-id",
        "type": "AUTHORIZATION_REQUEST",
      }
    `);
  });

  it("Resolves valid transaction report variables for transactionResult: ChargeFailureResult", () => {
    const transactionResult = new ChargeFailureResult({
      stripePaymentIntentId: mockedStripePaymentIntentId,
      stripeEnv: "LIVE",
    });

    const resolver = new TransactionEventReportVariablesResolver({
      saleorMoney: getMockedSaleorMoney(),
      transactionResult,
      saleorTransactionId: mockedSaleorTransactionIdBranded,
      date: new Date("2023-10-01T00:00:00Z"),
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
        "externalReference": "https://dashboard.stripe.com/payments/pi_TEST_TEST_TEST",
        "message": "Payment intent was cancelled",
        "pspReference": "pi_TEST_TEST_TEST",
        "time": "2023-10-01T00:00:00.000Z",
        "transactionId": "mocked-transaction-id",
        "type": "CHARGE_FAILURE",
      }
    `);
  });

  it("Resolves valid transaction report variables for transactionResult: AuthorizationFailure", () => {
    const transactionResult = new AuthorizationFailureResult({
      stripePaymentIntentId: mockedStripePaymentIntentId,
      stripeEnv: "LIVE",
    });

    const resolver = new TransactionEventReportVariablesResolver({
      transactionResult,
      saleorMoney: getMockedSaleorMoney(),
      saleorTransactionId: mockedSaleorTransactionIdBranded,
      date: new Date("2023-10-01T00:00:00Z"),
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
        "externalReference": "https://dashboard.stripe.com/payments/pi_TEST_TEST_TEST",
        "message": "Payment intent was cancelled",
        "pspReference": "pi_TEST_TEST_TEST",
        "time": "2023-10-01T00:00:00.000Z",
        "transactionId": "mocked-transaction-id",
        "type": "AUTHORIZATION_FAILURE",
      }
    `);
  });
});
