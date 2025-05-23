import { describe, expect, it } from "vitest";

import { getMockedSaleorMoney } from "@/__tests__/mocks/constants";
import { mockedStripePaymentIntentId } from "@/__tests__/mocks/mocked-stripe-payment-intent-id";
import { StripeAPIError } from "@/modules/stripe/stripe-api-error";
import { createStripeClientSecret } from "@/modules/stripe/stripe-client-secret";
import { createStripePaymentIntentStatus } from "@/modules/stripe/stripe-payment-intent-status";
import {
  AuthorizationActionRequiredResult,
  ChargeActionRequiredResult,
} from "@/modules/transaction-result/action-required-result";
import {
  AuthorizationFailureResult,
  ChargeFailureResult,
} from "@/modules/transaction-result/failure-result";

import { ParseError, UnsupportedPaymentMethodError } from "./event-data-parser";
import { TransactionInitializeSessionUseCaseResponses } from "./use-case-response";

describe("TransactionInitializeSessionUseCaseResponses", () => {
  describe("Success with ChargeActionRequired as result", () => {
    it("getResponse() returns valid Response with status 200 and formatted 'data' object containing Stripe client secret", async () => {
      const response = new TransactionInitializeSessionUseCaseResponses.Success({
        transactionResult: new ChargeActionRequiredResult(
          createStripePaymentIntentStatus("requires_payment_method"),
        ),
        stripePaymentIntentId: mockedStripePaymentIntentId,
        saleorMoney: getMockedSaleorMoney(10000),
        stripeClientSecret: createStripeClientSecret("stripe-client-secret")._unsafeUnwrap(),
        appContext: {
          stripeEnv: "LIVE",
        },
      });
      const fetchReponse = response.getResponse();

      expect(fetchReponse.status).toBe(200);
      expect(await fetchReponse.json()).toMatchInlineSnapshot(`
        {
          "amount": 100,
          "data": {
            "paymentIntent": {
              "stripeClientSecret": "stripe-client-secret",
            },
          },
          "externalUrl": "https://dashboard.stripe.com/payments/pi_TEST_TEST_TEST",
          "message": "Payment intent requires payment method",
          "pspReference": "pi_TEST_TEST_TEST",
          "result": "CHARGE_ACTION_REQUIRED",
        }
      `);
    });
  });

  describe("Success with AuthorizationActionRequired as result", () => {
    it("getResponse() returns valid Response with status 200 and formatted 'data' object containing Stripe client secret", async () => {
      const response = new TransactionInitializeSessionUseCaseResponses.Success({
        transactionResult: new AuthorizationActionRequiredResult(
          createStripePaymentIntentStatus("requires_payment_method"),
        ),

        stripePaymentIntentId: mockedStripePaymentIntentId,
        saleorMoney: getMockedSaleorMoney(10000),
        stripeClientSecret: createStripeClientSecret("stripe-client-secret")._unsafeUnwrap(),
        appContext: {
          stripeEnv: "LIVE",
        },
      });
      const fetchReponse = response.getResponse();

      expect(fetchReponse.status).toBe(200);
      expect(await fetchReponse.json()).toMatchInlineSnapshot(`
        {
          "amount": 100,
          "data": {
            "paymentIntent": {
              "stripeClientSecret": "stripe-client-secret",
            },
          },
          "externalUrl": "https://dashboard.stripe.com/payments/pi_TEST_TEST_TEST",
          "message": "Payment intent requires payment method",
          "pspReference": "pi_TEST_TEST_TEST",
          "result": "AUTHORIZATION_ACTION_REQUIRED",
        }
      `);
    });
  });

  describe("Failure with TransactionInitializeChargeErrorResult as a result", () => {
    it("getResponse() returns valid Response with status 200 and message with failure reason and additional information inside data object", async () => {
      const response = new TransactionInitializeSessionUseCaseResponses.Failure({
        transactionResult: new ChargeFailureResult(),
        error: new UnsupportedPaymentMethodError("UnsupportedPaymentMethodError"),
        appContext: {
          stripeEnv: "LIVE",
        },
      });
      const fetchReponse = response.getResponse();

      expect(fetchReponse.status).toBe(200);
      expect(await fetchReponse.json()).toMatchInlineSnapshot(`
        {
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
          "message": "Payment intent failed",
          "result": "CHARGE_FAILURE",
        }
      `);
    });

    it("getResponse() returns valid Response with status 200 and message with failure reason and BadRequest error inside data object", async () => {
      const successResponse = new TransactionInitializeSessionUseCaseResponses.Failure({
        transactionResult: new ChargeFailureResult(),
        error: new ParseError("Invalid data"),
        appContext: {
          stripeEnv: "LIVE",
        },
      });
      const fetchReponse = successResponse.getResponse();

      expect(fetchReponse.status).toBe(200);
      expect(await fetchReponse.json()).toMatchInlineSnapshot(`
        {
          "data": {
            "paymentIntent": {
              "errors": [
                {
                  "code": "ParseError",
                  "message": "Provided data is invalid. Check your data argument to transactionInitializeSession mutation and try again.",
                },
              ],
            },
          },
          "message": "Payment intent failed",
          "result": "CHARGE_FAILURE",
        }
      `);
    });

    it("getResponse() returns valid Response with status 200 and message with failure reason and StripeCreatePaymentIntentError error inside data object", async () => {
      const successResponse = new TransactionInitializeSessionUseCaseResponses.Failure({
        transactionResult: new ChargeFailureResult(),
        error: new StripeAPIError("Error from Stripe API", {
          cause: new Error("Inner error"),
        }),
        appContext: {
          stripeEnv: "LIVE",
        },
      });
      const fetchReponse = successResponse.getResponse();

      expect(fetchReponse.status).toBe(200);
      expect(await fetchReponse.json()).toMatchInlineSnapshot(`
        {
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
          "message": "Payment intent failed",
          "result": "CHARGE_FAILURE",
        }
      `);
    });

    it("getResponse() returns valid Response with status 200 and message with failure reason and StripeCreatePaymentIntentError error inside data object - TEST env passes Stripe error details", async () => {
      const successResponse = new TransactionInitializeSessionUseCaseResponses.Failure({
        transactionResult: new ChargeFailureResult(),
        error: new StripeAPIError("Error from Stripe API", {
          cause: new Error("Inner error"),
        }),
        appContext: {
          stripeEnv: "TEST",
        },
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
                  "code": "StripeApiError",
                  "message": "There is a problem with the request to Stripe API: Inner error
        Error from Stripe API",
                },
              ],
            },
          },
          "message": "Payment intent failed: Inner error
        Error from Stripe API",
          "result": "CHARGE_FAILURE",
        }
      `);
    });
  });

  describe("Error with TransactionInitializeAuthorizationErrorResult as a result", () => {
    it("getResponse() returns valid Response with status 200 and message with failure reason and additional information inside data object", async () => {
      const successResponse = new TransactionInitializeSessionUseCaseResponses.Failure({
        transactionResult: new AuthorizationFailureResult(),
        error: new UnsupportedPaymentMethodError("UnsupportedPaymentMethodError"),
        appContext: {
          stripeEnv: "LIVE",
        },
      });
      const fetchReponse = successResponse.getResponse();

      expect(fetchReponse.status).toBe(200);
      expect(await fetchReponse.json()).toMatchInlineSnapshot(`
        {
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
          "message": "Payment intent failed",
          "result": "AUTHORIZATION_FAILURE",
        }
      `);
    });

    it("getResponse() returns valid Response with status 200 and message with failure reason and BadRequest error inside data object", async () => {
      const successResponse = new TransactionInitializeSessionUseCaseResponses.Failure({
        transactionResult: new AuthorizationFailureResult(),
        error: new ParseError("Invalid data"),
        appContext: {
          stripeEnv: "LIVE",
        },
      });
      const fetchReponse = successResponse.getResponse();

      expect(fetchReponse.status).toBe(200);
      expect(await fetchReponse.json()).toMatchInlineSnapshot(`
        {
          "data": {
            "paymentIntent": {
              "errors": [
                {
                  "code": "ParseError",
                  "message": "Provided data is invalid. Check your data argument to transactionInitializeSession mutation and try again.",
                },
              ],
            },
          },
          "message": "Payment intent failed",
          "result": "AUTHORIZATION_FAILURE",
        }
      `);
    });

    it("getResponse() returns valid Response with status 200 and message with failure reason and StripeCreatePaymentIntentError error inside data object", async () => {
      const successResponse = new TransactionInitializeSessionUseCaseResponses.Failure({
        transactionResult: new AuthorizationFailureResult(),
        error: new StripeAPIError("Error from Stripe API"),
        appContext: {
          stripeEnv: "LIVE",
        },
      });
      const fetchReponse = successResponse.getResponse();

      expect(fetchReponse.status).toBe(200);
      expect(await fetchReponse.json()).toMatchInlineSnapshot(`
        {
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
          "message": "Payment intent failed",
          "result": "AUTHORIZATION_FAILURE",
        }
      `);
    });
  });
});
