import { describe, expect, it } from "vitest";

import { SaleorMoney } from "@/modules/saleor/saleor-money";
import { StripeInvalidRequestError } from "@/modules/stripe/stripe-payment-intent-api-error";
import { createStripePaymentIntentId } from "@/modules/stripe/stripe-payment-intent-id";

import { TransactionProcessSessionUseCaseResponses } from "./use-case-response";

describe("TransactionProcessSessionUseCaseResponses", () => {
  describe("ChargeActionRequired", () => {
    it("getResponse() returns valid Response with status 200 and message indicating that intent requires action", async () => {
      const successResponse = new TransactionProcessSessionUseCaseResponses.ChargeActionRequired({
        saleorMoney: SaleorMoney.createFromStripe({
          amount: 10000,
          currency: "usd",
        })._unsafeUnwrap(),
        stripePaymentIntentId: createStripePaymentIntentId("pi_1")._unsafeUnwrap(),
        stripeStatus: "requires_action",
      });
      const fetchReponse = successResponse.getResponse();

      expect(fetchReponse.status).toBe(200);
      expect(await fetchReponse.json()).toMatchInlineSnapshot(`
        {
          "amount": 100,
          "message": "Payment intent requires action",
          "pspReference": "pi_1",
          "result": "CHARGE_ACTION_REQUIRED",
        }
      `);
    });

    it("getResponse() returns valid Response with status 200 and message indicating that intent requires confirmation", async () => {
      const successResponse = new TransactionProcessSessionUseCaseResponses.ChargeActionRequired({
        saleorMoney: SaleorMoney.createFromStripe({
          amount: 10000,
          currency: "usd",
        })._unsafeUnwrap(),
        stripePaymentIntentId: createStripePaymentIntentId("pi_1")._unsafeUnwrap(),
        stripeStatus: "requires_confirmation",
      });
      const fetchReponse = successResponse.getResponse();

      expect(fetchReponse.status).toBe(200);
      expect(await fetchReponse.json()).toMatchInlineSnapshot(`
        {
          "amount": 100,
          "message": "Payment intent requires confirmation",
          "pspReference": "pi_1",
          "result": "CHARGE_ACTION_REQUIRED",
        }
      `);
    });

    it("getResponse() returns valid Response with status 200 and message indicating that intent requires payment method", async () => {
      const successResponse = new TransactionProcessSessionUseCaseResponses.ChargeActionRequired({
        saleorMoney: SaleorMoney.createFromStripe({
          amount: 10000,
          currency: "usd",
        })._unsafeUnwrap(),
        stripePaymentIntentId: createStripePaymentIntentId("pi_1")._unsafeUnwrap(),
        stripeStatus: "requires_payment_method",
      });
      const fetchReponse = successResponse.getResponse();

      expect(fetchReponse.status).toBe(200);
      expect(await fetchReponse.json()).toMatchInlineSnapshot(`
        {
          "amount": 100,
          "message": "Payment intent requires payment method",
          "pspReference": "pi_1",
          "result": "CHARGE_ACTION_REQUIRED",
        }
      `);
    });
  });

  describe("ChargeSuccess", () => {
    it("getResponse() returns valid Response with status 200 and message indicating that intent was succeeded", async () => {
      const successResponse = new TransactionProcessSessionUseCaseResponses.ChargeSuccess({
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
          "message": "Payment intent succeeded",
          "pspReference": "pi_1",
          "result": "CHARGE_SUCCESS",
        }
      `);
    });
  });

  describe("ChargeFailure", () => {
    it("getResponse() returns valid Response with status 200 and message with failure reason and additional information inside data object", async () => {
      const successResponse = new TransactionProcessSessionUseCaseResponses.ChargeFailure({
        error: new StripeInvalidRequestError("Invalid request"),
        saleorEventAmount: 21.23,
        stripePaymentIntentId: createStripePaymentIntentId("pi_1")._unsafeUnwrap(),
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
                  "code": "StripeApiError",
                  "message": "There is a problem with the request to Stripe API",
                },
              ],
            },
          },
          "message": "Payment intent error - there is a problem with the request to Stripe API",
          "pspReference": "pi_1",
          "result": "CHARGE_FAILURE",
        }
      `);
    });
  });

  describe("ChargeFailureForCancelledPaymentIntent", async () => {
    it("getResponse() returns valid Response with status 200 and message indicating that payment intent was canceled", async () => {
      const successResponse =
        new TransactionProcessSessionUseCaseResponses.ChargeFailureForCancelledPaymentIntent({
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
          "message": "Payment intent was cancelled",
          "pspReference": "pi_1",
          "result": "CHARGE_FAILURE",
        }
      `);
    });
  });

  describe("ChargeRequest", () => {
    it("getResponse() returns valid Response with status 200 and message indicating that intent is processing", async () => {
      const successResponse = new TransactionProcessSessionUseCaseResponses.ChargeRequest({
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
          "message": "Payment intent is processing",
          "pspReference": "pi_1",
          "result": "CHARGE_REQUEST",
        }
      `);
    });
  });
});
