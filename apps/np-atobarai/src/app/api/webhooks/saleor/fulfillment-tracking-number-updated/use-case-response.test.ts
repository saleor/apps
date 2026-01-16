import { describe, expect, it } from "vitest";

import { AtobaraiApiClientFulfillmentReportError } from "@/modules/atobarai/api/types";

import { FulfillmentTrackingNumberUpdatedUseCaseResponse } from "./use-case-response";

describe("FulfillmentTrackingNumberUpdatedUseCaseResponse", () => {
  describe("Success", () => {
    it("getResponse() returns valid Response with status 200 with success message", async () => {
      const response = new FulfillmentTrackingNumberUpdatedUseCaseResponse.Success();

      const fetchResponse = response.getResponse();

      expect(response.statusCode).toBe(200);
      expect(await fetchResponse.json()).toMatchInlineSnapshot(`
        {
          "message": "Successfully reported fulfillment",
        }
      `);
    });
  });

  describe("Failure", () => {
    it("getResponse() returns valid Response with status 200 with failure message", async () => {
      const response = new FulfillmentTrackingNumberUpdatedUseCaseResponse.Failure(
        new AtobaraiApiClientFulfillmentReportError("Test error"),
      );

      const fetchResponse = response.getResponse();

      expect(response.statusCode).toBe(200);
      expect(await fetchResponse.json()).toMatchInlineSnapshot(`
        {
          "message": "Failed to report fulfillment with Atobarai",
        }
      `);
    });
  });
});
