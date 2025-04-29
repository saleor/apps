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
      saleorMoney: getMockedSaleorMoney(),
      stripePaymentIntentId: mockedStripePaymentIntentId,
    });

    const resolver = new TransactionEventReportVariablesResolver({
      transactionResult,
      saleorTransactionId: mockedSaleorTransactionIdBranded,
      date: new Date("2023-10-01T00:00:00Z"),
    });

    expect(resolver.resolveEventReportVariables()).toMatchInlineSnapshot(`
      {
        "actions": [],
        "amount": SaleorMoney {
          "amount": 10,
          "currency": "USD",
        },
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
      saleorMoney: getMockedSaleorMoney(),
      stripePaymentIntentId: mockedStripePaymentIntentId,
    });

    const resolver = new TransactionEventReportVariablesResolver({
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
      saleorMoney: getMockedSaleorMoney(),
      stripePaymentIntentId: mockedStripePaymentIntentId,
      stripeStatus: createStripePaymentIntentStatus("requires_action")._unsafeUnwrap(),
    });

    const resolver = new TransactionEventReportVariablesResolver({
      transactionResult,
      saleorTransactionId: mockedSaleorTransactionIdBranded,
      date: new Date("2023-10-01T00:00:00Z"),
    });

    expect(resolver.resolveEventReportVariables()).toMatchInlineSnapshot(`
      {
        "actions": [],
        "amount": SaleorMoney {
          "amount": 10,
          "currency": "USD",
        },
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
      saleorMoney: getMockedSaleorMoney(),
      stripePaymentIntentId: mockedStripePaymentIntentId,
      stripeStatus: createStripePaymentIntentStatus("requires_action")._unsafeUnwrap(),
    });

    const resolver = new TransactionEventReportVariablesResolver({
      transactionResult,
      saleorTransactionId: mockedSaleorTransactionIdBranded,
      date: new Date("2023-10-01T00:00:00Z"),
    });

    expect(resolver.resolveEventReportVariables()).toMatchInlineSnapshot(`
      {
        "actions": [],
        "amount": SaleorMoney {
          "amount": 10,
          "currency": "USD",
        },
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
      saleorMoney: getMockedSaleorMoney(),
      stripePaymentIntentId: mockedStripePaymentIntentId,
    });

    const resolver = new TransactionEventReportVariablesResolver({
      transactionResult,
      saleorTransactionId: mockedSaleorTransactionIdBranded,
      date: new Date("2023-10-01T00:00:00Z"),
    });

    expect(resolver.resolveEventReportVariables()).toMatchInlineSnapshot(`
      {
        "actions": [],
        "amount": SaleorMoney {
          "amount": 10,
          "currency": "USD",
        },
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
      saleorMoney: getMockedSaleorMoney(),
      stripePaymentIntentId: mockedStripePaymentIntentId,
    });

    const resolver = new TransactionEventReportVariablesResolver({
      transactionResult,
      saleorTransactionId: mockedSaleorTransactionIdBranded,
      date: new Date("2023-10-01T00:00:00Z"),
    });

    expect(resolver.resolveEventReportVariables()).toMatchInlineSnapshot(`
      {
        "actions": [],
        "amount": SaleorMoney {
          "amount": 10,
          "currency": "USD",
        },
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
      saleorMoney: getMockedSaleorMoney(),
      stripePaymentIntentId: mockedStripePaymentIntentId,
    });

    const resolver = new TransactionEventReportVariablesResolver({
      transactionResult,
      saleorTransactionId: mockedSaleorTransactionIdBranded,
      date: new Date("2023-10-01T00:00:00Z"),
    });

    expect(resolver.resolveEventReportVariables()).toMatchInlineSnapshot(`
      {
        "actions": [],
        "amount": SaleorMoney {
          "amount": 10,
          "currency": "USD",
        },
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
      saleorMoney: getMockedSaleorMoney(),
      stripePaymentIntentId: mockedStripePaymentIntentId,
    });

    const resolver = new TransactionEventReportVariablesResolver({
      transactionResult,
      saleorTransactionId: mockedSaleorTransactionIdBranded,
      date: new Date("2023-10-01T00:00:00Z"),
    });

    expect(resolver.resolveEventReportVariables()).toMatchInlineSnapshot(`
      {
        "actions": [],
        "amount": SaleorMoney {
          "amount": 10,
          "currency": "USD",
        },
        "message": "Payment intent was cancelled",
        "pspReference": "pi_TEST_TEST_TEST",
        "time": "2023-10-01T00:00:00.000Z",
        "transactionId": "mocked-transaction-id",
        "type": "AUTHORIZATION_FAILURE",
      }
    `);
  });
});
