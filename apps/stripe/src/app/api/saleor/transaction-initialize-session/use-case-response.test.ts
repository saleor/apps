import { describe, expect, it } from "vitest";

import { SaleorMoney } from "@/modules/saleor/saleor-money";
import { createStripeClientSecret } from "@/modules/stripe/stripe-client-secret";
import { createStripePaymentIntentId } from "@/modules/stripe/stripe-payment-intent-id";

import { TransactionInitalizeSessionUseCaseResponses } from "./use-case-response";

describe("TransactionInitalizeSessionUseCaseResponses", () => {
  describe("ChargeRequest", () => {
    it("should return fetch API response with status code and message", async () => {
      const successResponse = new TransactionInitalizeSessionUseCaseResponses.ChargeRequest({
        stripeClientSecret: createStripeClientSecret("stripe-client-secret")._unsafeUnwrap(),
        saleorMoney: SaleorMoney.createFromStripe({
          amount: 10000,
          currency: "usd",
        })._unsafeUnwrap(),
        stripePaymentIntentId: createStripePaymentIntentId("pi_1")._unsafeUnwrap(),
      });
      const fetchReponse = successResponse.getResponse();

      expect(fetchReponse.status).toBe(200);
      expect(await fetchReponse.json()).toMatchInlineSnapshot(`
        {
          "amount": 100,
          "data": {
            "stripeClientSecret": "stripe-client-secret",
          },
          "pspReference": "pi_1",
          "result": "CHARGE_REQUEST",
        }
      `);
    });
  });

  describe("ChargeFailure", () => {
    it("should return fetch API response with status code and message", async () => {
      const successResponse = new TransactionInitalizeSessionUseCaseResponses.ChargeFailure({
        message: "Error message for Saleor dashboard",
      });
      const fetchReponse = successResponse.getResponse();

      expect(fetchReponse.status).toBe(200);
      expect(await fetchReponse.json()).toMatchInlineSnapshot(`
        {
          "message": "Error message for Saleor dashboard",
          "result": "CHARGE_FAILURE",
        }
      `);
    });
  });
});
