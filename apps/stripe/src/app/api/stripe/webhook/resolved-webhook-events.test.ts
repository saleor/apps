import { describe, expect, it } from "vitest";

import {
  getMockedSaleorMoney,
  mockedSaleorTransactionIdBranded,
} from "@/__tests__/mocks/constants";
import { mockedStripePaymentIntentId } from "@/__tests__/mocks/mocked-stripe-payment-intent-id";
import {
  AuthorizationActionRequiredResult,
  ChargeActionRequiredResult,
} from "@/modules/app-result/action-required-result";
import {
  AuthorizationFailureResult,
  ChargeFailureResult,
} from "@/modules/app-result/failure-result";
import {
  AuthorizationRequestResult,
  ChargeRequestResult,
} from "@/modules/app-result/request-result";
import {
  AuthorizationSuccessResult,
  ChargeSuccessResult,
} from "@/modules/app-result/success-result";
import { createStripePaymentIntentStatus } from "@/modules/stripe/stripe-payment-intent-status";

import { TransactionResult } from "./resolved-webhook-events";

describe("TransactionResult", () => {
  it("Returns valid transaction report variables for appResult: ChargeSuccess", () => {
    const appResult = new ChargeSuccessResult({
      saleorMoney: getMockedSaleorMoney(),
      stripePaymentIntentId: mockedStripePaymentIntentId,
    });

    const transactionResult = new TransactionResult({
      appResult,
      saleorTransactionId: mockedSaleorTransactionIdBranded,
      date: new Date("2023-10-01T00:00:00Z"),
    });

    expect(transactionResult.getTransactionEventReportVariables()).toMatchInlineSnapshot(`
      {
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

  it("Returns valid transaction report variables for appResult: AuthorizationSuccess", () => {
    const appResult = new AuthorizationSuccessResult({
      saleorMoney: getMockedSaleorMoney(),
      stripePaymentIntentId: mockedStripePaymentIntentId,
    });

    const transactionResult = new TransactionResult({
      appResult,
      saleorTransactionId: mockedSaleorTransactionIdBranded,
      date: new Date("2023-10-01T00:00:00Z"),
    });

    expect(transactionResult.getTransactionEventReportVariables()).toMatchInlineSnapshot(`
      {
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

  it("Returns valid transaction report variables for appResult: ChargeActionRequired", () => {
    const appResult = new ChargeActionRequiredResult({
      saleorMoney: getMockedSaleorMoney(),
      stripePaymentIntentId: mockedStripePaymentIntentId,
      stripeStatus: createStripePaymentIntentStatus("requires_action")._unsafeUnwrap(),
    });

    const transactionResult = new TransactionResult({
      appResult,
      saleorTransactionId: mockedSaleorTransactionIdBranded,
      date: new Date("2023-10-01T00:00:00Z"),
    });

    expect(transactionResult.getTransactionEventReportVariables()).toMatchInlineSnapshot(`
      {
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

  it("Returns valid transaction report variables for appResult: AuthorizationActionRequired", () => {
    const appResult = new AuthorizationActionRequiredResult({
      saleorMoney: getMockedSaleorMoney(),
      stripePaymentIntentId: mockedStripePaymentIntentId,
      stripeStatus: createStripePaymentIntentStatus("requires_action")._unsafeUnwrap(),
    });

    const transactionResult = new TransactionResult({
      appResult,
      saleorTransactionId: mockedSaleorTransactionIdBranded,
      date: new Date("2023-10-01T00:00:00Z"),
    });

    expect(transactionResult.getTransactionEventReportVariables()).toMatchInlineSnapshot(`
      {
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

  it("Returns valid transaction report variables for appResult: ChargeRequest", () => {
    const appResult = new ChargeRequestResult({
      saleorMoney: getMockedSaleorMoney(),
      stripePaymentIntentId: mockedStripePaymentIntentId,
    });

    const transactionResult = new TransactionResult({
      appResult,
      saleorTransactionId: mockedSaleorTransactionIdBranded,
      date: new Date("2023-10-01T00:00:00Z"),
    });

    expect(transactionResult.getTransactionEventReportVariables()).toMatchInlineSnapshot(`
      {
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

  it("Returns valid transaction report variables for appResult: AuthorizationRequest", () => {
    const appResult = new AuthorizationRequestResult({
      saleorMoney: getMockedSaleorMoney(),
      stripePaymentIntentId: mockedStripePaymentIntentId,
    });

    const transactionResult = new TransactionResult({
      appResult,
      saleorTransactionId: mockedSaleorTransactionIdBranded,
      date: new Date("2023-10-01T00:00:00Z"),
    });

    expect(transactionResult.getTransactionEventReportVariables()).toMatchInlineSnapshot(`
      {
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

  it("Returns valid transaction report variables for appResult: ChargeFailureResult", () => {
    const appResult = new ChargeFailureResult({
      saleorMoney: getMockedSaleorMoney(),
      stripePaymentIntentId: mockedStripePaymentIntentId,
    });

    const transactionResult = new TransactionResult({
      appResult,
      saleorTransactionId: mockedSaleorTransactionIdBranded,
      date: new Date("2023-10-01T00:00:00Z"),
    });

    expect(transactionResult.getTransactionEventReportVariables()).toMatchInlineSnapshot(`
      {
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

  it("Returns valid transaction report variables for appResult: AuthorizationFailure", () => {
    const appResult = new AuthorizationFailureResult({
      saleorMoney: getMockedSaleorMoney(),
      stripePaymentIntentId: mockedStripePaymentIntentId,
    });

    const transactionResult = new TransactionResult({
      appResult,
      saleorTransactionId: mockedSaleorTransactionIdBranded,
      date: new Date("2023-10-01T00:00:00Z"),
    });

    expect(transactionResult.getTransactionEventReportVariables()).toMatchInlineSnapshot(`
      {
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
