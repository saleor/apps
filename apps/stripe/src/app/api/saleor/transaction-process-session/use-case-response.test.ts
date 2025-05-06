import { describe, expect, it } from "vitest";

import { getMockedSaleorMoney } from "@/__tests__/mocks/constants";
import { mockedStripePaymentIntentId } from "@/__tests__/mocks/mocked-stripe-payment-intent-id";
import { StripeInvalidRequestError } from "@/modules/stripe/stripe-payment-intent-api-error";
import { createStripePaymentIntentStatus } from "@/modules/stripe/stripe-payment-intent-status";
import {
  AuthorizationActionRequiredResult,
  ChargeActionRequiredResult,
} from "@/modules/transaction-result/action-required-result";
import {
  AuthorizationFailureResult,
  ChargeFailureResult,
} from "@/modules/transaction-result/failure-result";
import {
  AuthorizationRequestResult,
  ChargeRequestResult,
} from "@/modules/transaction-result/request-result";
import {
  AuthorizationSuccessResult,
  ChargeSuccessResult,
} from "@/modules/transaction-result/success-result";

import { TransactionProcessSessionUseCaseResponses } from "./use-case-response";

describe("TransactionProcessSessionUseCaseResponses", () => {
  describe("Ok", () => {
    it("getResponse() returns valid Response with status 200 and message indicating that intent is succeeded if transactionResult is ChargeSuccess", async () => {
      const transactionResult = new ChargeSuccessResult({
        stripePaymentIntentId: mockedStripePaymentIntentId,
        stripeEnv: "TEST",
      });
      const response = new TransactionProcessSessionUseCaseResponses.Ok({
        saleorMoney: getMockedSaleorMoney(),
        transactionResult,
      });
      const fetchResponse = response.getResponse();

      expect(fetchResponse.status).toBe(200);
      expect(await fetchResponse.json()).toMatchInlineSnapshot(`
        {
          "actions": [],
          "amount": 10,
          "externalUrl": "https://dashboard.stripe.com/test/payments/pi_TEST_TEST_TEST",
          "message": "Payment intent succeeded",
          "pspReference": "pi_TEST_TEST_TEST",
          "result": "CHARGE_SUCCESS",
        }
      `);
    });

    it("getResponse() returns valid Response with status 200 and message indicating that intent is succeeded if transactionResult is AuthorizationSuccess", async () => {
      const transactionResult = new AuthorizationSuccessResult({
        stripePaymentIntentId: mockedStripePaymentIntentId,
        stripeEnv: "LIVE",
      });
      const response = new TransactionProcessSessionUseCaseResponses.Ok({
        saleorMoney: getMockedSaleorMoney(),
        transactionResult,
      });
      const fetchReponse = response.getResponse();

      expect(fetchReponse.status).toBe(200);
      expect(await fetchReponse.json()).toMatchInlineSnapshot(`
        {
          "actions": [
            "CHARGE",
          ],
          "amount": 10,
          "externalUrl": "https://dashboard.stripe.com/payments/pi_TEST_TEST_TEST",
          "message": "Payment intent succeeded",
          "pspReference": "pi_TEST_TEST_TEST",
          "result": "AUTHORIZATION_SUCCESS",
        }
      `);
    });

    it("getResponse() returns valid Response with status 200 and message indicating that intent requires action if transactionResult is ChargeActionRequired", async () => {
      const transactionResult = new ChargeActionRequiredResult({
        stripePaymentIntentId: mockedStripePaymentIntentId,
        stripeStatus: createStripePaymentIntentStatus("requires_action")._unsafeUnwrap(),
        stripeEnv: "LIVE",
      });
      const response = new TransactionProcessSessionUseCaseResponses.Ok({
        saleorMoney: getMockedSaleorMoney(),
        transactionResult,
      });
      const fetchResponse = response.getResponse();

      expect(fetchResponse.status).toBe(200);
      expect(await fetchResponse.json()).toMatchInlineSnapshot(`
        {
          "actions": [],
          "amount": 10,
          "externalUrl": "https://dashboard.stripe.com/payments/pi_TEST_TEST_TEST",
          "message": "Payment intent requires action",
          "pspReference": "pi_TEST_TEST_TEST",
          "result": "CHARGE_ACTION_REQUIRED",
        }
      `);
    });

    it("getResponse() returns valid Response with status 200 and message indicating that intent requires action if transactionResult is AuthorizationActionRequired", async () => {
      const transactionResult = new AuthorizationActionRequiredResult({
        stripePaymentIntentId: mockedStripePaymentIntentId,
        stripeStatus: createStripePaymentIntentStatus("requires_action")._unsafeUnwrap(),
        stripeEnv: "LIVE",
      });
      const response = new TransactionProcessSessionUseCaseResponses.Ok({
        saleorMoney: getMockedSaleorMoney(),
        transactionResult,
      });
      const fetchReponse = response.getResponse();

      expect(fetchReponse.status).toBe(200);
      expect(await fetchReponse.json()).toMatchInlineSnapshot(`
        {
          "actions": [],
          "amount": 10,
          "externalUrl": "https://dashboard.stripe.com/payments/pi_TEST_TEST_TEST",
          "message": "Payment intent requires action",
          "pspReference": "pi_TEST_TEST_TEST",
          "result": "AUTHORIZATION_ACTION_REQUIRED",
        }
      `);
    });

    it("getResponse() returns valid Response with status 200 and message indicating that intent is processing if transactionResult is ChargeRequest", async () => {
      const transactionResult = new ChargeRequestResult({
        stripePaymentIntentId: mockedStripePaymentIntentId,
        stripeEnv: "LIVE",
      });
      const response = new TransactionProcessSessionUseCaseResponses.Ok({
        saleorMoney: getMockedSaleorMoney(),
        transactionResult,
      });
      const fetchReponse = response.getResponse();

      expect(fetchReponse.status).toBe(200);
      expect(await fetchReponse.json()).toMatchInlineSnapshot(`
        {
          "actions": [],
          "amount": 10,
          "externalUrl": "https://dashboard.stripe.com/payments/pi_TEST_TEST_TEST",
          "message": "Payment intent is processing",
          "pspReference": "pi_TEST_TEST_TEST",
          "result": "CHARGE_REQUEST",
        }
      `);
    });

    it("getResponse() returns valid Response with status 200 and message indicating that intent is processing if transactionResult is AuthorizationRequest", async () => {
      const transactionResult = new AuthorizationRequestResult({
        stripePaymentIntentId: mockedStripePaymentIntentId,
        stripeEnv: "LIVE",
      });
      const response = new TransactionProcessSessionUseCaseResponses.Ok({
        saleorMoney: getMockedSaleorMoney(),
        transactionResult,
      });
      const fetchResponse = response.getResponse();

      expect(fetchResponse.status).toBe(200);
      expect(await fetchResponse.json()).toMatchInlineSnapshot(`
        {
          "actions": [],
          "amount": 10,
          "externalUrl": "https://dashboard.stripe.com/payments/pi_TEST_TEST_TEST",
          "message": "Payment intent is processing",
          "pspReference": "pi_TEST_TEST_TEST",
          "result": "AUTHORIZATION_REQUEST",
        }
      `);
    });

    it("getResponse() returns valid Response with status 200 and message indicating that intent is cancelled if transactionResult is ChargeFailure", async () => {
      const transactionResult = new ChargeFailureResult({
        stripePaymentIntentId: mockedStripePaymentIntentId,
        stripeEnv: "LIVE",
      });
      const response = new TransactionProcessSessionUseCaseResponses.Ok({
        saleorMoney: getMockedSaleorMoney(),
        transactionResult,
      });
      const fetchReponse = response.getResponse();

      expect(fetchReponse.status).toBe(200);
      expect(await fetchReponse.json()).toMatchInlineSnapshot(`
        {
          "actions": [
            "CHARGE",
          ],
          "amount": 10,
          "externalUrl": "https://dashboard.stripe.com/payments/pi_TEST_TEST_TEST",
          "message": "Payment intent was cancelled",
          "pspReference": "pi_TEST_TEST_TEST",
          "result": "CHARGE_FAILURE",
        }
      `);
    });

    it("getResponse() returns valid Response with status 200 and message indicating that intent is cancelled if transactionResult is AuthorizationFailure", async () => {
      const transactionResult = new AuthorizationFailureResult({
        stripePaymentIntentId: mockedStripePaymentIntentId,
        stripeEnv: "LIVE",
      });
      const response = new TransactionProcessSessionUseCaseResponses.Ok({
        saleorMoney: getMockedSaleorMoney(),
        transactionResult,
      });
      const fetchReponse = response.getResponse();

      expect(fetchReponse.status).toBe(200);
      expect(await fetchReponse.json()).toMatchInlineSnapshot(`
        {
          "actions": [],
          "amount": 10,
          "externalUrl": "https://dashboard.stripe.com/payments/pi_TEST_TEST_TEST",
          "message": "Payment intent was cancelled",
          "pspReference": "pi_TEST_TEST_TEST",
          "result": "AUTHORIZATION_FAILURE",
        }
      `);
    });

    describe("Error", () => {
      it("getResponse() returns valid Response with status 200 and message with error reason and additional information inside data object if transactionResult is ChargeError", async () => {
        const transactionResult = new ChargeFailureResult({
          stripePaymentIntentId: mockedStripePaymentIntentId,
          stripeEnv: "LIVE",
        });

        const successResponse = new TransactionProcessSessionUseCaseResponses.Error({
          saleorEventAmount: 21.23,
          error: new StripeInvalidRequestError("Invalid request"),
          transactionResult,
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
            "externalUrl": "https://dashboard.stripe.com/payments/pi_TEST_TEST_TEST",
            "message": "Payment intent error - there is a problem with the request to Stripe API",
            "pspReference": "pi_TEST_TEST_TEST",
            "result": "CHARGE_FAILURE",
          }
        `);
      });

      it("getResponse() returns valid Response with status 200 and message with error reason and additional information inside data object if transactionResult is AuthorizationError", async () => {
        const transactionResult = new AuthorizationFailureResult({
          stripePaymentIntentId: mockedStripePaymentIntentId,
          stripeEnv: "LIVE",
        });

        const successResponse = new TransactionProcessSessionUseCaseResponses.Error({
          saleorEventAmount: 21.23,
          error: new StripeInvalidRequestError("Invalid request"),
          transactionResult,
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
            "externalUrl": "https://dashboard.stripe.com/payments/pi_TEST_TEST_TEST",
            "message": "Payment intent error - there is a problem with the request to Stripe API",
            "pspReference": "pi_TEST_TEST_TEST",
            "result": "AUTHORIZATION_FAILURE",
          }
        `);
      });
    });
  });
});
