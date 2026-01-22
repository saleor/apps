import { describe, expect, it } from "vitest";

import { mockedSourceObject } from "@/__tests__/mocks/saleor-events/mocked-source-object";

import { ParsedRefundEvent } from "../refund-event-parser";
import { BaseRefundOrchestrator } from "./base-refund-orchestrator";

// Concrete implementation for testing the abstract class
class TestRefundOrchestrator extends BaseRefundOrchestrator {
  // @ts-expect-error - testing
  async processRefund() {
    throw new Error("Not implemented - this is just for testing base methods");
  }
}

describe("BaseRefundOrchestrator", () => {
  const orchestrator = new TestRefundOrchestrator();

  describe("isFullRefundStrategy", () => {
    const baseParsedEvent: ParsedRefundEvent = {
      refundedAmount: 1000,
      sourceObjectTotalAmount: 2000,
      channelId: "channel-1",
      pspReference: "psp-ref-123",
      transactionToken: "transaction-token",
      issuedAt: "2023-01-01T00:00:00Z",
      sourceObject: mockedSourceObject,
      grantedRefund: null,
      currency: "JPY",
      transactionTotalCharged: 1500,
    };

    it("should return true when refunded amount equals transaction total charged", () => {
      const parsedEvent: ParsedRefundEvent = {
        ...baseParsedEvent,
        refundedAmount: 1500,
        transactionTotalCharged: 1500,
      };

      const result = orchestrator.isFullRefundStrategy(parsedEvent);

      expect(result).toBe(true);
    });

    it("should return false when refunded amount equals source object total but not transaction total charged", () => {
      // This scenario can happen when there are multiple payment methods (e.g., gift card + credit card)
      const parsedEvent: ParsedRefundEvent = {
        ...baseParsedEvent,
        refundedAmount: 2000, // Equals sourceObjectTotalAmount
        sourceObjectTotalAmount: 2000,
        transactionTotalCharged: 1500, // Transaction only charged 1500
      };

      const result = orchestrator.isFullRefundStrategy(parsedEvent);

      expect(result).toBe(false);
    });

    it("should return false when refunded amount is less than transaction total charged", () => {
      const parsedEvent: ParsedRefundEvent = {
        ...baseParsedEvent,
        refundedAmount: 1000,
        transactionTotalCharged: 1500,
      };

      const result = orchestrator.isFullRefundStrategy(parsedEvent);

      expect(result).toBe(false);
    });

    it("should return false when refunded amount is greater than transaction total charged", () => {
      const parsedEvent: ParsedRefundEvent = {
        ...baseParsedEvent,
        refundedAmount: 2000,
        transactionTotalCharged: 1500,
      };

      const result = orchestrator.isFullRefundStrategy(parsedEvent);

      expect(result).toBe(false);
    });

    it("should handle case when transaction charged equals source object total", () => {
      // Normal case where there's only one payment method
      const parsedEvent: ParsedRefundEvent = {
        ...baseParsedEvent,
        refundedAmount: 2000,
        sourceObjectTotalAmount: 2000,
        transactionTotalCharged: 2000,
      };

      const result = orchestrator.isFullRefundStrategy(parsedEvent);

      expect(result).toBe(true);
    });
  });

  describe("isPartialRefundWithLineItemsStrategy", () => {
    it("should return true when refunded amount is less than total and granted refund exists", () => {
      const parsedEvent: ParsedRefundEvent = {
        refundedAmount: 1000,
        sourceObjectTotalAmount: 2000,
        channelId: "channel-1",
        pspReference: "psp-ref-123",
        transactionToken: "transaction-token",
        issuedAt: "2023-01-01T00:00:00Z",
        sourceObject: mockedSourceObject,
        grantedRefund: {
          lines: [{ orderLine: { id: "line-1" }, quantity: 1 }],
          shippingCostsIncluded: false,
        },
        currency: "JPY",
        transactionTotalCharged: 2000,
      };

      const result = orchestrator.isPartialRefundWithLineItemsStrategy(parsedEvent);

      expect(result).toBe(true);
    });

    it("should return false when granted refund is null", () => {
      const parsedEvent: ParsedRefundEvent = {
        refundedAmount: 1000,
        sourceObjectTotalAmount: 2000,
        channelId: "channel-1",
        pspReference: "psp-ref-123",
        transactionToken: "transaction-token",
        issuedAt: "2023-01-01T00:00:00Z",
        sourceObject: mockedSourceObject,
        grantedRefund: null,
        currency: "JPY",
        transactionTotalCharged: 2000,
      };

      const result = orchestrator.isPartialRefundWithLineItemsStrategy(parsedEvent);

      expect(result).toBe(false);
    });
  });

  describe("isPartialRefundWithoutLineItemsStrategy", () => {
    it("should return true when refunded amount is less than total and no granted refund", () => {
      const parsedEvent: ParsedRefundEvent = {
        refundedAmount: 1000,
        sourceObjectTotalAmount: 2000,
        channelId: "channel-1",
        pspReference: "psp-ref-123",
        transactionToken: "transaction-token",
        issuedAt: "2023-01-01T00:00:00Z",
        sourceObject: mockedSourceObject,
        grantedRefund: null,
        currency: "JPY",
        transactionTotalCharged: 2000,
      };

      const result = orchestrator.isPartialRefundWithoutLineItemsStrategy(parsedEvent);

      expect(result).toBe(true);
    });

    it("should return false when granted refund exists", () => {
      const parsedEvent: ParsedRefundEvent = {
        refundedAmount: 1000,
        sourceObjectTotalAmount: 2000,
        channelId: "channel-1",
        pspReference: "psp-ref-123",
        transactionToken: "transaction-token",
        issuedAt: "2023-01-01T00:00:00Z",
        sourceObject: mockedSourceObject,
        grantedRefund: {
          lines: [{ orderLine: { id: "line-1" }, quantity: 1 }],
          shippingCostsIncluded: false,
        },
        currency: "JPY",
        transactionTotalCharged: 2000,
      };

      const result = orchestrator.isPartialRefundWithoutLineItemsStrategy(parsedEvent);

      expect(result).toBe(false);
    });
  });
});
