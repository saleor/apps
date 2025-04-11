import { describe, expect, it } from "vitest";

import { SaleorMoney } from "@/modules/saleor/saleor-money";

import { responseData, stripePaymentIntentId } from "./response-data";
import { TransactionInitalizeSessionUseCaseResponses } from "./use-case-response";

describe("TransactionInitalizeSessionUseCaseResponses", () => {
  describe("ChargeRequest", () => {
    it("should return fetch API response with status code and message", async () => {
      const successResponse = new TransactionInitalizeSessionUseCaseResponses.ChargeRequest({
        responseData: responseData.parse({
          stripeClientSecret: "stripe_client_secret",
        }),
        saleorMoney: SaleorMoney.createFromStripe({
          amount: 10000,
          currency: "usd",
        })._unsafeUnwrap(),
        stripePaymentIntentId: stripePaymentIntentId.parse("pi_1"),
      });
      const fetchReponse = successResponse.getResponse();

      expect(fetchReponse.status).toBe(200);
      expect(await fetchReponse.json()).toMatchInlineSnapshot(`
        {
          "amount": 100,
          "data": {
            "stripeClientSecret": "stripe_client_secret",
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
