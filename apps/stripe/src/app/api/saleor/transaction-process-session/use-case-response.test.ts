import { describe, expect, it } from "vitest";

import {
  AuthorizationActionRequiredResult,
  ChargeActionRequiredResult,
} from "@/modules/app-result/action-required-result";
import { AuthorizationErrorResult, ChargeErrorResult } from "@/modules/app-result/error-result";
import {
  AuthorizationFailureResult,
  ChargeFailureResult,
} from "@/modules/app-result/failure-result";
import {
  AuthorizationRequestResult,
  ChargeRequestResult,
} from "@/modules/app-result/request-result";
import {
  AuthorizationSuccessResult,
  ChargeSuccessResult,
} from "@/modules/app-result/success-result";
import { SaleorMoney } from "@/modules/saleor/saleor-money";
import { StripeInvalidRequestError } from "@/modules/stripe/stripe-payment-intent-api-error";
import { createStripePaymentIntentId } from "@/modules/stripe/stripe-payment-intent-id";
import { createStripePaymentIntentStatus } from "@/modules/stripe/stripe-payment-intent-status";

import { TransactionProcessSessionUseCaseResponses } from "./use-case-response";

describe("TransactionProcessSessionUseCaseResponses", () => {
  // TODO: move to it.each
  describe("OK", () => {
    it("getResponse() returns valid Response with status 200 and message indicating that intent is succeded if appResult is ChargeSuccess", async () => {
      const appResult = new ChargeSuccessResult({
        saleorMoney: SaleorMoney.createFromStripe({
          amount: 10000,
          currency: "usd",
        })._unsafeUnwrap(),
        stripePaymentIntentId: createStripePaymentIntentId("pi_1")._unsafeUnwrap(),
      });
      const response = new TransactionProcessSessionUseCaseResponses.OK({
        appResult,
      });
      const fetchReponse = response.getResponse();

      expect(fetchReponse.status).toBe(200);
      expect(await fetchReponse.json()).toMatchInlineSnapshot(`
        {
          "actions": [
            "REFUND",
          ],
          "amount": 100,
          "message": "Payment intent succeeded",
          "pspReference": "pi_1",
          "result": "CHARGE_SUCCESS",
        }
      `);
    });

    it("getResponse() returns valid Response with status 200 and message indicating that intent is succeded if appResult is AuthorizationSuccess", async () => {
      const appResult = new AuthorizationSuccessResult({
        saleorMoney: SaleorMoney.createFromStripe({
          amount: 10000,
          currency: "usd",
        })._unsafeUnwrap(),
        stripePaymentIntentId: createStripePaymentIntentId("pi_1")._unsafeUnwrap(),
      });
      const response = new TransactionProcessSessionUseCaseResponses.OK({
        appResult,
      });
      const fetchReponse = response.getResponse();

      expect(fetchReponse.status).toBe(200);
      expect(await fetchReponse.json()).toMatchInlineSnapshot(`
        {
          "actions": [
            "CANCEL",
          ],
          "amount": 100,
          "message": "Payment intent succeeded",
          "pspReference": "pi_1",
          "result": "AUTHORIZATION_SUCCESS",
        }
      `);
    });

    it("getResponse() returns valid Response with status 200 and message indicating that intent requires action if appResult is ChargeActionRequired", async () => {
      const appResult = new ChargeActionRequiredResult({
        saleorMoney: SaleorMoney.createFromStripe({
          amount: 10000,
          currency: "usd",
        })._unsafeUnwrap(),
        stripePaymentIntentId: createStripePaymentIntentId("pi_1")._unsafeUnwrap(),
        stripeStatus: createStripePaymentIntentStatus("requires_action")._unsafeUnwrap(),
      });
      const response = new TransactionProcessSessionUseCaseResponses.OK({
        appResult,
      });
      const fetchReponse = response.getResponse();

      expect(fetchReponse.status).toBe(200);
      expect(await fetchReponse.json()).toMatchInlineSnapshot(`
        {
          "actions": [],
          "amount": 100,
          "message": "Payment intent requires action",
          "pspReference": "pi_1",
          "result": "CHARGE_ACTION_REQUIRED",
        }
      `);
    });

    it("getResponse() returns valid Response with status 200 and message indicating that intent requires action if appResult is AuthorizationActionRequired", async () => {
      const appResult = new AuthorizationActionRequiredResult({
        saleorMoney: SaleorMoney.createFromStripe({
          amount: 10000,
          currency: "usd",
        })._unsafeUnwrap(),
        stripePaymentIntentId: createStripePaymentIntentId("pi_1")._unsafeUnwrap(),
        stripeStatus: createStripePaymentIntentStatus("requires_action")._unsafeUnwrap(),
      });
      const response = new TransactionProcessSessionUseCaseResponses.OK({
        appResult,
      });
      const fetchReponse = response.getResponse();

      expect(fetchReponse.status).toBe(200);
      expect(await fetchReponse.json()).toMatchInlineSnapshot(`
        {
          "actions": [],
          "amount": 100,
          "message": "Payment intent requires action",
          "pspReference": "pi_1",
          "result": "AUTHORIZATION_ACTION_REQUIRED",
        }
      `);
    });

    it("getResponse() returns valid Response with status 200 and message indicating that intent is processing if appResult is ChargeRequest", async () => {
      const appResult = new ChargeRequestResult({
        saleorMoney: SaleorMoney.createFromStripe({
          amount: 10000,
          currency: "usd",
        })._unsafeUnwrap(),
        stripePaymentIntentId: createStripePaymentIntentId("pi_1")._unsafeUnwrap(),
      });
      const response = new TransactionProcessSessionUseCaseResponses.OK({
        appResult,
      });
      const fetchReponse = response.getResponse();

      expect(fetchReponse.status).toBe(200);
      expect(await fetchReponse.json()).toMatchInlineSnapshot(`
        {
          "actions": [],
          "amount": 100,
          "message": "Payment intent is processing",
          "pspReference": "pi_1",
          "result": "CHARGE_REQUEST",
        }
      `);
    });

    it("getResponse() returns valid Response with status 200 and message indicating that intent is processing if appResult is AuthorizationRequest", async () => {
      const appResult = new AuthorizationRequestResult({
        saleorMoney: SaleorMoney.createFromStripe({
          amount: 10000,
          currency: "usd",
        })._unsafeUnwrap(),
        stripePaymentIntentId: createStripePaymentIntentId("pi_1")._unsafeUnwrap(),
      });
      const response = new TransactionProcessSessionUseCaseResponses.OK({
        appResult,
      });
      const fetchReponse = response.getResponse();

      expect(fetchReponse.status).toBe(200);
      expect(await fetchReponse.json()).toMatchInlineSnapshot(`
        {
          "actions": [],
          "amount": 100,
          "message": "Payment intent is processing",
          "pspReference": "pi_1",
          "result": "AUTHORIZATION_REQUEST",
        }
      `);
    });

    it("getResponse() returns valid Response with status 200 and message indicating that intent is cancelled if appResult is ChargeFailure", async () => {
      const appResult = new ChargeFailureResult({
        saleorMoney: SaleorMoney.createFromStripe({
          amount: 10000,
          currency: "usd",
        })._unsafeUnwrap(),
        stripePaymentIntentId: createStripePaymentIntentId("pi_1")._unsafeUnwrap(),
      });
      const response = new TransactionProcessSessionUseCaseResponses.OK({
        appResult,
      });
      const fetchReponse = response.getResponse();

      expect(fetchReponse.status).toBe(200);
      expect(await fetchReponse.json()).toMatchInlineSnapshot(`
        {
          "actions": [],
          "amount": 100,
          "message": "Payment intent was cancelled",
          "pspReference": "pi_1",
          "result": "CHARGE_FAILURE",
        }
      `);
    });

    it("getResponse() returns valid Response with status 200 and message indicating that intent is cancelled if appResult is AuthorizationFailure", async () => {
      const appResult = new AuthorizationFailureResult({
        saleorMoney: SaleorMoney.createFromStripe({
          amount: 10000,
          currency: "usd",
        })._unsafeUnwrap(),
        stripePaymentIntentId: createStripePaymentIntentId("pi_1")._unsafeUnwrap(),
      });
      const response = new TransactionProcessSessionUseCaseResponses.OK({
        appResult,
      });
      const fetchReponse = response.getResponse();

      expect(fetchReponse.status).toBe(200);
      expect(await fetchReponse.json()).toMatchInlineSnapshot(`
        {
          "actions": [],
          "amount": 100,
          "message": "Payment intent was cancelled",
          "pspReference": "pi_1",
          "result": "AUTHORIZATION_FAILURE",
        }
      `);
    });

    describe("Error", () => {
      it("getResponse() returns valid Response with status 200 and message with error reason and additional information inside data object if appResult is ChargeError", async () => {
        const appResult = new ChargeErrorResult({
          saleorEventAmount: 21.23,
          stripePaymentIntentId: createStripePaymentIntentId("pi_1")._unsafeUnwrap(),
        });

        const successResponse = new TransactionProcessSessionUseCaseResponses.Error({
          error: new StripeInvalidRequestError("Invalid request"),
          appResult,
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

      it("getResponse() returns valid Response with status 200 and message with error reason and additional information inside data object if appResult is AuthorizationError", async () => {
        const appResult = new AuthorizationErrorResult({
          saleorEventAmount: 21.23,
          stripePaymentIntentId: createStripePaymentIntentId("pi_1")._unsafeUnwrap(),
        });

        const successResponse = new TransactionProcessSessionUseCaseResponses.Error({
          error: new StripeInvalidRequestError("Invalid request"),
          appResult,
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
            "result": "AUTHORIZATION_FAILURE",
          }
        `);
      });
    });
  });
});
