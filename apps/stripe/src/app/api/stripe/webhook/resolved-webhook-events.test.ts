import { describe, expect, it } from "vitest";

import { mockedSaleorTransactionId } from "@/__tests__/mocks/constants";
import { mockedStripePaymentIntentId } from "@/__tests__/mocks/mocked-stripe-payment-intent-id";
import {
  TransactionAuthorizationSuccess,
  TransactionChargeSuccess,
} from "@/app/api/stripe/webhook/resolved-webhook-events";
import { SaleorMoney } from "@/modules/saleor/saleor-money";

describe("TransactionChargeSuccess", () => {
  it("Returns valid transaction report variables for this specific report", () => {
    expect(
      new TransactionChargeSuccess({
        amount: SaleorMoney.createFromStripe({
          amount: 10_00,
          currency: "usd",
        })._unsafeUnwrap(),
        date: new Date("2023-10-01T00:00:00Z"),
        saleorTransactionId: mockedSaleorTransactionId,
        pspRef: mockedStripePaymentIntentId,
      }),
    ).toMatchInlineSnapshot(`
      TransactionChargeSuccess {
        "amount": SaleorMoney {
          "amount": 10,
          "currency": "USD",
        },
        "availableActions": [
          "REFUND",
        ],
        "date": 2023-10-01T00:00:00.000Z,
        "message": "Successfully charged",
        "pspRef": "pi_TEST_TEST_TEST",
        "saleorEventType": "CHARGE_SUCCESS",
        "saleorTransactionId": "mocked-transaction-id",
      }
    `);
  });
});

describe("TransactionAuthorizationSuccess", () => {
  it("Returns valid transaction report variables for this specific report", () => {
    expect(
      new TransactionAuthorizationSuccess({
        amount: SaleorMoney.createFromStripe({
          amount: 10_00,
          currency: "usd",
        })._unsafeUnwrap(),
        date: new Date("2023-10-01T00:00:00Z"),
        saleorTransactionId: mockedSaleorTransactionId,
        pspRef: mockedStripePaymentIntentId,
      }),
    ).toMatchInlineSnapshot(`
      TransactionAuthorizationSuccess {
        "amount": SaleorMoney {
          "amount": 10,
          "currency": "USD",
        },
        "availableActions": [
          "CANCEL",
        ],
        "date": 2023-10-01T00:00:00.000Z,
        "message": "Successfully authorized",
        "pspRef": "pi_TEST_TEST_TEST",
        "saleorEventType": "AUTHORIZATION_SUCCESS",
        "saleorTransactionId": "mocked-transaction-id",
      }
    `);
  });
});
