import { describe, expect, it } from "vitest";

import { mockedSaleorTransactionIdBranded } from "@/__tests__/mocks/constants";
import { mockedStripePaymentIntentId } from "@/__tests__/mocks/mocked-stripe-payment-intent-id";
import { ChargeSuccessResult } from "@/modules/app-result/success-result";
import { SaleorMoney } from "@/modules/saleor/saleor-money";

import { TransactionResult } from "./resolved-webhook-events";

// TODO: add more test cases for other transaction results
describe("TransactionResult", () => {
  it("Returns valid transaction report variables for appResult: ChargeSuccess", () => {
    const appResult = new ChargeSuccessResult({
      saleorMoney: SaleorMoney.createFromStripe({
        amount: 10_00,
        currency: "usd",
      })._unsafeUnwrap(),
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
});
