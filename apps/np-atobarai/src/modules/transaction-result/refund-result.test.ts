import { describe, expect, it } from "vitest";

import { RefundFailureResult } from "./refund-result";

describe("RefundFailureResult", () => {
  describe("message generation based on reason", () => {
    it("should generate correct message for cancelFailure reason", () => {
      const result = new RefundFailureResult({ reason: "cancelFailure" });

      expect(result.message).toBe(
        "Failed to process NP Atobarai transaction refund: canceling transaction failed",
      );
    });

    it("should generate correct message for registerFailure reason", () => {
      const result = new RefundFailureResult({ reason: "registerFailure" });

      expect(result.message).toBe(
        "Failed to process NP Atobarai transaction refund: re-registering transaction failed",
      );
    });

    it("should generate correct message for fulfillmentFailure reason", () => {
      const result = new RefundFailureResult({ reason: "fulfillmentFailure" });

      expect(result.message).toBe(
        "Failed to process NP Atobarai transaction refund: fulfilling transaction failed",
      );
    });

    it("should generate correct message for missingData reason", () => {
      const result = new RefundFailureResult({ reason: "missingData" });

      expect(result.message).toBe(
        "Failed to process NP Atobarai transaction refund: missing required data for refund",
      );
    });

    it("should generate correct message for changeTransaction reason", () => {
      const result = new RefundFailureResult({ reason: "changeTransaction" });

      expect(result.message).toBe(
        "Failed to process NP Atobarai transaction refund: changing transaction failed",
      );
    });
  });
});
