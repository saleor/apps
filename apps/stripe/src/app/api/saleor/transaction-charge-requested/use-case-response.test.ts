import { describe, expect, it } from "vitest";

import { getMockedSaleorMoney } from "@/__tests__/mocks/constants";
import { mockedStripePaymentIntentId } from "@/__tests__/mocks/mocked-stripe-payment-intent-id";
import { StripeAPIError } from "@/modules/stripe/stripe-api-error";
import { ChargeFailureResult } from "@/modules/transaction-result/failure-result";
import { ChargeSuccessResult } from "@/modules/transaction-result/success-result";

import { TransactionChargeRequestedUseCaseResponses } from "./use-case-response";

describe("TransactionChargeRequestedUseCaseResponses", () => {
  describe("Success with ChargeSuccessResult", () => {
    it("getResponse() returns valid Response with status 200", async () => {
      const successResponse = new TransactionChargeRequestedUseCaseResponses.Success({
        transactionResult: new ChargeSuccessResult({
          stripePaymentIntentId: mockedStripePaymentIntentId,
          stripeEnv: "TEST",
        }),
        saleorMoney: getMockedSaleorMoney(),
      });
      const fetchReponse = successResponse.getResponse();

      expect(fetchReponse.status).toBe(200);
      expect(await fetchReponse.json()).toMatchInlineSnapshot(`
        {
          "actions": [
            "REFUND",
          ],
          "amount": 10,
          "externalUrl": "https://dashboard.stripe.com/test/payments/pi_TEST_TEST_TEST",
          "message": "Payment intent has been successful",
          "pspReference": "pi_TEST_TEST_TEST",
          "result": "CHARGE_SUCCESS",
        }
      `);
    });
  });

  describe("Failure with ChargeFailureResult", () => {
    it("getResponse() returns valid Response with status 200", async () => {
      const successResponse = new TransactionChargeRequestedUseCaseResponses.Failure({
        transactionResult: new ChargeFailureResult({
          stripePaymentIntentId: mockedStripePaymentIntentId,
          stripeEnv: "LIVE",
        }),
        error: new StripeAPIError("Error from stripe"),
        saleorEventAmount: 112.33,
      });
      const fetchReponse = successResponse.getResponse();

      expect(fetchReponse.status).toBe(200);
      expect(await fetchReponse.json()).toMatchInlineSnapshot(`
        {
          "actions": [
            "CHARGE",
          ],
          "amount": 112.33,
          "externalUrl": "https://dashboard.stripe.com/payments/pi_TEST_TEST_TEST",
          "message": "There is a problem with the request to Stripe API",
          "pspReference": "pi_TEST_TEST_TEST",
          "result": "CHARGE_FAILURE",
        }
      `);
    });
  });
});
