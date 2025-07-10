import { describe, expect, it } from "vitest";

import { PaymentGatewayInitializeSessionUseCaseResponses } from "./use-case-response";
import { UnsupportedCurrencyError } from "./validation-errors";

describe("PaymentGatewayInitializeSessionUseCaseResponses", () => {
  describe("Success", () => {
    it("getResponse() returns valid Response with status 200", async () => {
      const successResponse = new PaymentGatewayInitializeSessionUseCaseResponses.Success();

      const fetchReponse = successResponse.getResponse();

      expect(fetchReponse.status).toBe(200);
      expect(await fetchReponse.json()).toMatchInlineSnapshot(`
        {
          "data": {},
        }
      `);
    });
  });

  describe("Failure", () => {
    it("getResponse() returns valid Response with status 400 and formatted 'data' object containing error", async () => {
      const failureResponse = new PaymentGatewayInitializeSessionUseCaseResponses.Failure(
        new UnsupportedCurrencyError("Unsupported currency", {
          props: {
            publicMessage: `Public message for storefront`,
          },
        }),
      );

      const fetchReponse = failureResponse.getResponse();

      expect(fetchReponse.status).toBe(200);
      expect(await fetchReponse.json()).toMatchInlineSnapshot(`
        {
          "data": {
            "errors": [
              {
                "code": "UnsupportedCurrencyError",
                "message": "Public message for storefront",
              },
            ],
          },
        }
      `);
    });
  });
});
