import { describe, expect, it } from "vitest";

import { mockedStripePublishableKey } from "@/__tests__/mocks/mocked-stripe-publishable-key";

import { PaymentGatewayInitializeSessionUseCaseResponses } from "./use-case-response";

describe("PaymentGatewayInitializeSessionUseCaseResponses", () => {
  describe("Success", () => {
    it("getResponse() returns valid Response with status 200 and formatted 'data' object containing Stripe PK", async () => {
      const successResponse = new PaymentGatewayInitializeSessionUseCaseResponses.Success({
        pk: mockedStripePublishableKey,
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
