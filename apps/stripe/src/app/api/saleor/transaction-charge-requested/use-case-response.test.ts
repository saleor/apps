import { describe, expect, it } from "vitest";

import { getMockedSaleorMoney } from "@/__tests__/mocks/constants";
import { mockedStripePaymentIntentId } from "@/__tests__/mocks/mocked-stripe-payment-intent-id";
import { StripeAPIError } from "@/modules/stripe/stripe-payment-intent-api-error";

import { TransactionChargeRequestedUseCaseResponses } from "./use-case-response";

describe("TransactionChargeRequestedUseCaseResponses", () => {
  describe("ChargeSuccess", () => {
    it("getResponse() returns valid Response with status 200", async () => {
      const successResponse = new TransactionChargeRequestedUseCaseResponses.ChargeSuccess({
        saleorMoney: getMockedSaleorMoney(),
        stripePaymentIntentId: mockedStripePaymentIntentId,
      });
      const fetchReponse = successResponse.getResponse();

      expect(fetchReponse.status).toBe(200);
      expect(await fetchReponse.json()).toMatchInlineSnapshot(`
        {
          "actions": [],
          "amount": 10,
          "message": "Payment intent sucessfully charged",
          "pspReference": "pi_TEST_TEST_TEST",
          "result": "CHARGE_SUCCESS",
        }
      `);
    });
  });

  describe("ChargeFailure", () => {
    it("getResponse() returns valid Response with status 200", async () => {
      const successResponse = new TransactionChargeRequestedUseCaseResponses.ChargeFailure({
        saleorEventAmount: 112.33,
        error: new StripeAPIError("Error from stripe"),
        stripePaymentIntentId: mockedStripePaymentIntentId,
      });
      const fetchReponse = successResponse.getResponse();

      expect(fetchReponse.status).toBe(200);
      expect(await fetchReponse.json()).toMatchInlineSnapshot(`
        {
          "actions": [
            "CHARGE",
          ],
          "amount": 112.33,
          "message": "Payment intent error - there is a problem with the request to Stripe API",
          "pspReference": "pi_TEST_TEST_TEST",
          "result": "CHARGE_FAILURE",
        }
      `);
    });
  });
});
