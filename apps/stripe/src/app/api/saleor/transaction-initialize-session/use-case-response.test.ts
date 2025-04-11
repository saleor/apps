import { describe, expect, it } from "vitest";

import { TransactionInitalizeSessionUseCaseResponses } from "./use-case-response";

describe("TransactionInitalizeSessionUseCaseResponses", () => {
  describe("ChargeRequest", () => {
    it("should return fetch API response with status code and message", async () => {
      const successResponse = new TransactionInitalizeSessionUseCaseResponses.ChargeRequest({
        responseData: {
          stripeClientSecret: "stripe_client_secret",
        },
        amount: 100,
        pspReference: "pk_1",
      });
      const fetchReponse = successResponse.getResponse();

      expect(fetchReponse.status).toBe(200);
      expect(await fetchReponse.json()).toMatchInlineSnapshot(`
        {
          "amount": 100,
          "data": {
            "stripeClientSecret": "stripe_client_secret",
          },
          "pspReference": "pk_1",
          "result": "CHARGE_REQUEST",
        }
      `);
    });
  });

  describe("ChargeFailure", () => {
    it("should return fetch API response with status code and message", async () => {
      const successResponse = new TransactionInitalizeSessionUseCaseResponses.ChargeFailure({
        message: "Error message for Saleor dashboard",
        amount: 100,
      });
      const fetchReponse = successResponse.getResponse();

      expect(fetchReponse.status).toBe(200);
      expect(await fetchReponse.json()).toMatchInlineSnapshot(`
        {
          "amount": 100,
          "message": "Error message for Saleor dashboard",
          "result": "CHARGE_FAILURE",
        }
      `);
    });
  });
});
