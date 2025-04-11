import { describe, expect, it } from "vitest";

import { stripePublishableKey } from "@/__tests__/mocks/stripe-publishable-key";

import { PaymentGatewayInitializeSessionUseCaseResponses } from "./use-case-response";

describe("PaymentGatewayInitializeSessionUseCaseResponses", () => {
  describe("Success", () => {
    it("should return fetch API response with status code and message", async () => {
      const successResponse = new PaymentGatewayInitializeSessionUseCaseResponses.Success({
        responseData: {
          stripePublishableKey: stripePublishableKey.keyValue,
        },
      });
      const fetchReponse = successResponse.getResponse();

      expect(fetchReponse.status).toBe(200);
      expect(await fetchReponse.json()).toMatchInlineSnapshot(`
        {
          "data": {
            "stripePublishableKey": "pk_live_1",
          },
        }
      `);
    });
  });
});
