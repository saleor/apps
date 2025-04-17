import { describe, expect, it } from "vitest";

import { SaleorMoney } from "@/modules/saleor/saleor-money";
import { createStripeClientSecret } from "@/modules/stripe/stripe-client-secret";
import { createStripePaymentIntentId } from "@/modules/stripe/stripe-payment-intent-id";
import { StripePaymentIntentsApi } from "@/modules/stripe/stripe-payment-intents-api";

import { ParseError, UnsupportedPaymentMethodError } from "./event-data-parser";
import { TransactionInitalizeSessionUseCaseResponses } from "./use-case-response";

describe("TransactionInitalizeSessionUseCaseResponses", () => {
  describe("ChargeActionRequired", () => {
    it("getResponse() returns valid Response with status 200 and formatted 'data' object containing Stripe client secret", async () => {
      const successResponse = new TransactionInitalizeSessionUseCaseResponses.ChargeActionRequired({
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
            "paymentIntent": {
              "stripeClientSecret": "stripe-client-secret",
            },
          },
          "pspReference": "pi_1",
          "result": "CHARGE_ACTION_REQUIRED",
        }
      `);
    });
  });

  describe("ChargeFailure", () => {
    it("getResponse() returns valid Response with status 200 and message with failure reason and additional information inside data object", async () => {
      const successResponse = new TransactionInitalizeSessionUseCaseResponses.ChargeFailure({
        message: "Error message for Saleor dashboard",
        error: new UnsupportedPaymentMethodError("UnsupportedPaymentMethodError"),
        saleorEventAmount: 21.23,
      });
      const fetchReponse = successResponse.getResponse();

      expect(fetchReponse.status).toBe(200);
      expect(await fetchReponse.json()).toMatchInlineSnapshot(`
        {
          "amount": 21.23,
          "data": {
            "paymentIntent": {
              "errors": [
                {
                  "code": "UnsupportedPaymentMethodError",
                  "message": "Provided payment method is not supported",
                },
              ],
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
        error: new ParseError("Invalid data"),
        saleorEventAmount: 21.123,
      });
      const fetchReponse = successResponse.getResponse();

      expect(fetchReponse.status).toBe(200);
      expect(await fetchReponse.json()).toMatchInlineSnapshot(`
        {
          "amount": 21.123,
          "data": {
            "paymentIntent": {
              "errors": [
                {
                  "code": "BadRequestError",
                  "message": "Provided data is invalid. Check your data argument to transactionInitializeSession mutation and try again.",
                },
              ],
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
        error: new StripePaymentIntentsApi.UnknownError("Error from Stripe API"),
        saleorEventAmount: 100.123,
      });
      const fetchReponse = successResponse.getResponse();

      expect(fetchReponse.status).toBe(200);
      expect(await fetchReponse.json()).toMatchInlineSnapshot(`
        {
          "amount": 100.123,
          "data": {
            "paymentIntent": {
              "errors": [
                {
                  "code": "StripeCreatePaymentIntentError",
                  "message": "Stripe API returned error while creating payment intent",
                },
              ],
            },
          },
          "message": "Error message for Saleor dashboard",
          "result": "CHARGE_FAILURE",
        }
      `);
    });
  });
});
