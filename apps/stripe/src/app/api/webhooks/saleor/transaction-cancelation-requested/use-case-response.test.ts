import { describe, expect, it } from "vitest";

import { getMockedSaleorMoney } from "@/__tests__/mocks/constants";
import { mockedStripePaymentIntentId } from "@/__tests__/mocks/mocked-stripe-payment-intent-id";
import { StripeAPIError } from "@/modules/stripe/stripe-api-error";
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
        transactionResult: new CancelSuccessResult(),
        stripeEnv: "TEST",
        stripePaymentIntentId: mockedStripePaymentIntentId,
        timestamp: new Date(2023, 0, 1),
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
          "time": "2023-01-01T00:00:00.000Z",
        }
      `);
    });
  });

  describe("Failure", () => {
    it("getResponse() returns valid Response with status 200", async () => {
      const response = new TransactionCancelationRequestedUseCaseResponses.Failure({
        transactionResult: new CancelFailureResult(),
        stripeEnv: "LIVE",
        stripePaymentIntentId: mockedStripePaymentIntentId,
        error: new StripeAPIError("Error from stripe"),
      });
      const fetchReponse = response.getResponse();

      expect(fetchReponse.status).toBe(200);

      expect(await fetchReponse.json()).toMatchInlineSnapshot(`
        {
          "actions": [
            "CANCEL",
          ],
          "externalUrl": "https://dashboard.stripe.com/payments/pi_TEST_TEST_TEST",
          "message": "There is a problem with the request to Stripe API",
          "pspReference": "pi_TEST_TEST_TEST",
          "result": "CANCEL_FAILURE",
        }
      `);
    });
  });
});
