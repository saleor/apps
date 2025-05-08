import { describe, expect, it } from "vitest";

import { getMockedSaleorMoney } from "@/__tests__/mocks/constants";
import { mockedStripePaymentIntentId } from "@/__tests__/mocks/mocked-stripe-payment-intent-id";
import {
  RefundFailureResult,
  RefundRequestResult,
  RefundSuccessResult,
} from "@/modules/transaction-result/refund-result";

import { TransactionRefundRequestedUseCaseResponses } from "./use-case-response";

describe("TransactionRefundRequestedUseCaseResponses", () => {
  describe("Success with RefundSuccessResult", () => {
    it("getResponse() returns valid Response with status 200", async () => {
      const response = new TransactionRefundRequestedUseCaseResponses.Success({
        transactionResult: new RefundSuccessResult({
          stripeEnv: "TEST",
          stripePaymentIntentId: mockedStripePaymentIntentId,
        }),
        saleorMoney: getMockedSaleorMoney(),
      });
      const fetchReponse = response.getResponse();

      expect(fetchReponse.status).toBe(200);
      expect(await fetchReponse.json()).toMatchInlineSnapshot(`
        {
          "actions": [],
          "amount": 10,
          "externalUrl": "https://dashboard.stripe.com/test/payments/pi_TEST_TEST_TEST",
          "message": "Refund was successful",
          "pspReference": "pi_TEST_TEST_TEST",
          "result": "REFUND_SUCCESS",
        }
      `);
    });
  });

  describe("Success with RefundRequestResult", () => {
    it("getResponse() returns valid Response with status 200", async () => {
      const response = new TransactionRefundRequestedUseCaseResponses.Success({
        transactionResult: new RefundRequestResult({
          stripeEnv: "TEST",
          stripePaymentIntentId: mockedStripePaymentIntentId,
        }),
        saleorMoney: getMockedSaleorMoney(),
      });
      const fetchReponse = response.getResponse();

      expect(fetchReponse.status).toBe(200);
      expect(await fetchReponse.json()).toMatchInlineSnapshot(`
        {
          "actions": [],
          "amount": 10,
          "externalUrl": "https://dashboard.stripe.com/test/payments/pi_TEST_TEST_TEST",
          "message": "Refund is processing",
          "pspReference": "pi_TEST_TEST_TEST",
          "result": "REFUND_REQUEST",
        }
      `);
    });
  });

  describe("Success with RefundFailureResult", () => {
    it("getResponse() returns valid Response with status 200", async () => {
      const response = new TransactionRefundRequestedUseCaseResponses.Success({
        transactionResult: new RefundFailureResult({
          stripeEnv: "TEST",
          stripePaymentIntentId: mockedStripePaymentIntentId,
        }),
        saleorMoney: getMockedSaleorMoney(),
      });
      const fetchReponse = response.getResponse();

      expect(fetchReponse.status).toBe(200);
      expect(await fetchReponse.json()).toMatchInlineSnapshot(`
        {
          "actions": [
            "REFUND",
          ],
          "amount": 10,
          "externalUrl": "https://dashboard.stripe.com/test/payments/pi_TEST_TEST_TEST",
          "message": "Refund failed",
          "pspReference": "pi_TEST_TEST_TEST",
          "result": "REFUND_FAILURE",
        }
      `);
    });
  });

  describe("Failure with RefundFailureResult", () => {
    it("getResponse() returns valid Response with status 200", async () => {
      const response = new TransactionRefundRequestedUseCaseResponses.Failure({
        transactionResult: new RefundFailureResult({
          stripeEnv: "TEST",
          stripePaymentIntentId: mockedStripePaymentIntentId,
        }),
        saleorEventAmount: 112.33,
      });
      const fetchReponse = response.getResponse();

      expect(fetchReponse.status).toBe(200);
      expect(await fetchReponse.json()).toMatchInlineSnapshot(`
        {
          "actions": [
            "REFUND",
          ],
          "amount": 112.33,
          "externalUrl": "https://dashboard.stripe.com/test/payments/pi_TEST_TEST_TEST",
          "message": "Refund failed",
          "pspReference": "pi_TEST_TEST_TEST",
          "result": "REFUND_FAILURE",
        }
      `);
    });
  });
});
