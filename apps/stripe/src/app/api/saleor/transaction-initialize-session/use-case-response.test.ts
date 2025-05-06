import { describe, expect, it } from "vitest";

import { getMockedSaleorMoney } from "@/__tests__/mocks/constants";
import { mockedStripePaymentIntentId } from "@/__tests__/mocks/mocked-stripe-payment-intent-id";
import { createStripeClientSecret } from "@/modules/stripe/stripe-client-secret";
import { StripeAPIError } from "@/modules/stripe/stripe-payment-intent-api-error";
import { createStripePaymentIntentStatus } from "@/modules/stripe/stripe-payment-intent-status";
import {
  AuthorizationActionRequiredResult,
  ChargeActionRequiredResult,
} from "@/modules/transaction-result/action-required-result";

import {
  TransactionInitializeAuthorizationErrorResult,
  TransactionInitializeChargeErrorResult,
} from "./error-result";
import { ParseError, UnsupportedPaymentMethodError } from "./event-data-parser";
import { TransactionInitializeSessionUseCaseResponses } from "./use-case-response";

describe("TransactionInitalizeSessionUseCaseResponses", () => {
  describe("Ok with ChargeActionRequired as result", () => {
    it("getResponse() returns valid Response with status 200 and formatted 'data' object containing Stripe client secret", async () => {
      const response = new TransactionInitializeSessionUseCaseResponses.Ok({
        transactionResult: new ChargeActionRequiredResult({
          saleorMoney: getMockedSaleorMoney(),
          stripePaymentIntentId: mockedStripePaymentIntentId,
          stripeStatus: createStripePaymentIntentStatus("requires_payment_method")._unsafeUnwrap(),
          stripeEnv: "LIVE",
        }),
        stripeClientSecret: createStripeClientSecret("stripe-client-secret")._unsafeUnwrap(),
      });
      const fetchReponse = response.getResponse();

      expect(fetchReponse.status).toBe(200);
      expect(await fetchReponse.json()).toMatchInlineSnapshot(`
        {
          "amount": 10,
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

  describe("Ok with AuthorizationActionRequired as result", () => {
    it("getResponse() returns valid Response with status 200 and formatted 'data' object containing Stripe client secret", async () => {
      const response = new TransactionInitializeSessionUseCaseResponses.Ok({
        transactionResult: new AuthorizationActionRequiredResult({
          saleorMoney: getMockedSaleorMoney(),
          stripePaymentIntentId: mockedStripePaymentIntentId,
          stripeStatus: createStripePaymentIntentStatus("requires_payment_method")._unsafeUnwrap(),
          stripeEnv: "TEST",
        }),
        stripeClientSecret: createStripeClientSecret("stripe-client-secret")._unsafeUnwrap(),
      });
      const fetchReponse = response.getResponse();

      expect(fetchReponse.status).toBe(200);
      expect(await fetchReponse.json()).toMatchInlineSnapshot(`
        {
          "amount": 10,
          "data": {
            "paymentIntent": {
              "stripeClientSecret": "stripe-client-secret",
            },
          },
          "externalUrl": "https://dashboard.stripe.com/test/payments/pi_TEST_TEST_TEST",
          "message": "Payment intent requires payment method",
          "pspReference": "pi_TEST_TEST_TEST",
          "result": "AUTHORIZATION_ACTION_REQUIRED",
        }
      `);
    });
  });

  describe("Error with TransactionInitializeChargeErrorResult as a result", () => {
    it("getResponse() returns valid Response with status 200 and message with failure reason and additional information inside data object", async () => {
      const response = new TransactionInitializeSessionUseCaseResponses.Error({
        transactionResult: new TransactionInitializeChargeErrorResult({
          saleorEventAmount: 21.23,
        }),
        error: new UnsupportedPaymentMethodError("UnsupportedPaymentMethodError"),
      });
      const fetchReponse = response.getResponse();

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
          "message": "Payment intent not created - provided payment method is not supported",
          "result": "CHARGE_FAILURE",
        }
      `);
    });

    it("getResponse() returns valid Response with status 200 and message with failure reason and BadRequest error inside data object", async () => {
      const successResponse = new TransactionInitializeSessionUseCaseResponses.Error({
        transactionResult: new TransactionInitializeChargeErrorResult({
          saleorEventAmount: 21.23,
        }),
        error: new ParseError("Invalid data"),
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
                  "code": "ParseError",
                  "message": "Provided data is invalid. Check your data argument to transactionInitializeSession mutation and try again.",
                },
              ],
            },
          },
          "message": "Payment intent not created - storefront sent invalid data",
          "result": "CHARGE_FAILURE",
        }
      `);
    });

    it("getResponse() returns valid Response with status 200 and message with failure reason and StripeCreatePaymentIntentError error inside data object", async () => {
      const successResponse = new TransactionInitializeSessionUseCaseResponses.Error({
        transactionResult: new TransactionInitializeChargeErrorResult({
          saleorEventAmount: 21.23,
        }),
        error: new StripeAPIError("Error from Stripe API"),
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
          "result": "CHARGE_FAILURE",
        }
      `);
    });
  });

  describe("Error with TransactionInitializeAuthorizationErrorResult as a result", () => {
    it("getResponse() returns valid Response with status 200 and message with failure reason and additional information inside data object", async () => {
      const successResponse = new TransactionInitializeSessionUseCaseResponses.Error({
        transactionResult: new TransactionInitializeAuthorizationErrorResult({
          saleorEventAmount: 21.23,
        }),
        error: new UnsupportedPaymentMethodError("UnsupportedPaymentMethodError"),
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
          "message": "Payment intent not created - provided payment method is not supported",
          "result": "AUTHORIZATION_FAILURE",
        }
      `);
    });

    it("getResponse() returns valid Response with status 200 and message with failure reason and BadRequest error inside data object", async () => {
      const successResponse = new TransactionInitializeSessionUseCaseResponses.Error({
        transactionResult: new TransactionInitializeAuthorizationErrorResult({
          saleorEventAmount: 21.23,
        }),
        error: new ParseError("Invalid data"),
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
                  "code": "ParseError",
                  "message": "Provided data is invalid. Check your data argument to transactionInitializeSession mutation and try again.",
                },
              ],
            },
          },
          "message": "Payment intent not created - storefront sent invalid data",
          "result": "AUTHORIZATION_FAILURE",
        }
      `);
    });

    it("getResponse() returns valid Response with status 200 and message with failure reason and StripeCreatePaymentIntentError error inside data object", async () => {
      const successResponse = new TransactionInitializeSessionUseCaseResponses.Error({
        transactionResult: new TransactionInitializeAuthorizationErrorResult({
          saleorEventAmount: 21.23,
        }),
        error: new StripeAPIError("Error from Stripe API"),
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
          "result": "AUTHORIZATION_FAILURE",
        }
      `);
    });
  });
});
