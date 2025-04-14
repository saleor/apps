import { describe, expect, it } from "vitest";

import { SaleorMoney } from "@/modules/saleor/saleor-money";
import { createStripeClientSecret } from "@/modules/stripe/stripe-client-secret";
import { createStripePaymentIntentId } from "@/modules/stripe/stripe-payment-intent-id";
import { StripePaymentIntentsApi } from "@/modules/stripe/stripe-payment-intents-api";

import { UnsupportedPaymentMethodError, ValidationError } from "./request-data-parser";
import { TransactionInitalizeSessionUseCaseResponses } from "./use-case-response";

describe("TransactionInitalizeSessionUseCaseResponses", () => {
  describe("ChargeRequest", () => {
    it("getResponse() returns valid Response with status 200 and formatted 'data' object containing Stripe client secret", async () => {
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
    it("getResponse() returns valid Response with status 200 and message with failure reason and additional information inside data object", async () => {
      const successResponse = new TransactionInitalizeSessionUseCaseResponses.ChargeFailure({
        message: "Error message for Saleor dashboard",
        error: new UnsupportedPaymentMethodError("UnsupportedPaymentMethodError"),
      });
      const fetchReponse = successResponse.getResponse();

      expect(fetchReponse.status).toBe(200);
      expect(await fetchReponse.json()).toMatchInlineSnapshot(`
        {
          "data": {
            "paymentIntent": {
              "error": {
                "description": "Provided payment method is not supported",
                "reason": "UnsupportedPaymentMethodError",
              },
            },
          },
          "message": "Error message for Saleor dashboard",
          "result": "CHARGE_FAILURE",
        }
      `);
    });

    it("getResponse() returns valid Response with status 200 and message with failure reason and BadRequest error inside data object", async () => {
      const successResponse = new TransactionInitalizeSessionUseCaseResponses.ChargeFailure({
        message: "Error message for Saleor dashboard",
        error: new ValidationError("Invalid data"),
      });
      const fetchReponse = successResponse.getResponse();

      expect(fetchReponse.status).toBe(200);
      expect(await fetchReponse.json()).toMatchInlineSnapshot(`
        {
          "data": {
            "paymentIntent": {
              "error": {
                "description": "Provided data is invalid. Check your data argument to transactionInitalizeSession mutation and try again.",
                "reason": "BadRequestError",
              },
            },
          },
          "message": "Error message for Saleor dashboard",
          "result": "CHARGE_FAILURE",
        }
      `);
    });

    it("getResponse() returns valid Response with status 200 and message with failure reason and StripeCreatePaymentIntentError error inside data object", async () => {
      const successResponse = new TransactionInitalizeSessionUseCaseResponses.ChargeFailure({
        message: "Error message for Saleor dashboard",
        error: new StripePaymentIntentsApi.CreatePaymentIntentError("Error from Stripe API"),
      });
      const fetchReponse = successResponse.getResponse();

      expect(fetchReponse.status).toBe(200);
      expect(await fetchReponse.json()).toMatchInlineSnapshot(`
        {
          "data": {
            "paymentIntent": {
              "error": {
                "description": "Stripe API returned error while creating payment intent",
                "reason": "StripeCreatePaymentIntentError",
              },
            },
          },
          "message": "Error message for Saleor dashboard",
          "result": "CHARGE_FAILURE",
        }
      `);
    });
  });
});
