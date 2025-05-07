import { describe, expect, it } from "vitest";

import { getMockedSaleorMoney } from "@/__tests__/mocks/constants";
import { mockedStripePaymentIntentId } from "@/__tests__/mocks/mocked-stripe-payment-intent-id";
import { StripeAPIError } from "@/modules/stripe/stripe-payment-intent-api-error";
import {
  CancelFailureResult,
  CancelSuccessResult,
} from "@/modules/transaction-result/cancel-result";

import { TransactionCancelationRequestedUseCaseResponses } from "./use-case-response";

describe("TransactionCancelationRequestedUseCaseResponses", () => {
  describe("Success", () => {
    it("getResponse() returns valid Response with status 200", async () => {
      const response = new TransactionCancelationRequestedUseCaseResponses.Success({
        saleorMoney: getMockedSaleorMoney(),
        transactionResult: new CancelSuccessResult({
          stripePaymentIntentId: mockedStripePaymentIntentId,
          stripeEnv: "TEST",
        }),
      });
      const fetchReponse = response.getResponse();

      expect(fetchReponse.status).toBe(200);

      expect(await fetchReponse.json()).toMatchInlineSnapshot(`
        {
          "actions": [],
          "amount": 10,
          "externalUrl": "https://dashboard.stripe.com/test/payments/pi_TEST_TEST_TEST",
          "message": "Payment intent was cancelled",
          "pspReference": "pi_TEST_TEST_TEST",
          "result": "CANCEL_SUCCESS",
        }
      `);
    });
  });

  describe("Failure", () => {
    it("getResponse() returns valid Response with status 200", async () => {
      const response = new TransactionCancelationRequestedUseCaseResponses.Failure({
        transactionResult: new CancelFailureResult({
          stripePaymentIntentId: mockedStripePaymentIntentId,
          stripeEnv: "LIVE",
        }),
        saleorEventAmount: 0,
        error: new StripeAPIError("Error from stripe"),
      });
      const fetchReponse = response.getResponse();

      expect(fetchReponse.status).toBe(200);

      expect(await fetchReponse.json()).toMatchInlineSnapshot(`
        {
          "actions": [
            "CANCEL",
          ],
          "amount": 0,
          "externalUrl": "https://dashboard.stripe.com/payments/pi_TEST_TEST_TEST",
          "message": "Payment intent error - there is a problem with the request to Stripe API",
          "pspReference": "pi_TEST_TEST_TEST",
          "result": "CANCEL_FAILURE",
        }
      `);
    });
  });
});
