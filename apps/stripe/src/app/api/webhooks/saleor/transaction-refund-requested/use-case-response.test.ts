import { describe, expect, it } from "vitest";

import { mockedStripePaymentIntentId } from "@/__tests__/mocks/mocked-stripe-payment-intent-id";
import { mockedStripeRefundId } from "@/__tests__/mocks/mocked-stripe-refund-id";
import { StripeAPIError } from "@/modules/stripe/stripe-api-error";
import { RefundFailureResult } from "@/modules/transaction-result/refund-result";

import { TransactionRefundRequestedUseCaseResponses } from "./use-case-response";

describe("TransactionRefundRequestedUseCaseResponses", () => {
  describe("Success", () => {
    it("getResponse() returns valid Response with status 200", async () => {
      const response = new TransactionRefundRequestedUseCaseResponses.Success({
        stripeRefundId: mockedStripeRefundId,
        appContext: {
          stripeEnv: "LIVE",
        },
      });
      const fetchReponse = response.getResponse();

      expect(fetchReponse.status).toBe(200);
      expect(await fetchReponse.json()).toMatchInlineSnapshot(`
        {
          "pspReference": "re_TEST_TEST_TEST",
        }
      `);
    });
  });

  describe("Failure", () => {
    it("getResponse() returns valid Response with status 200", async () => {
      const response = new TransactionRefundRequestedUseCaseResponses.Failure({
        transactionResult: new RefundFailureResult(),
        stripePaymentIntentId: mockedStripePaymentIntentId,
        saleorEventAmount: 112.33,
        error: new StripeAPIError("Error from stripe"),
        appContext: {
          stripeEnv: "LIVE",
        },
      });
      const fetchReponse = response.getResponse();

      expect(fetchReponse.status).toBe(200);
      expect(await fetchReponse.json()).toMatchInlineSnapshot(`
        {
          "actions": [
            "REFUND",
          ],
          "amount": 112.33,
          "externalUrl": "https://dashboard.stripe.com/payments/pi_TEST_TEST_TEST",
          "message": "There is a problem with the request to Stripe API",
          "pspReference": "pi_TEST_TEST_TEST",
          "result": "REFUND_FAILURE",
        }
      `);
    });
  });
});
