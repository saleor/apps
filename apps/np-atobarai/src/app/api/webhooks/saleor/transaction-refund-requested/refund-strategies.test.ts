import { ok } from "neverthrow";
import { beforeEach, describe, expect, it } from "vitest";

import { mockedAppChannelConfig } from "@/__tests__/mocks/app-config/mocked-app-config";
import { mockedAtobaraiApiClient } from "@/__tests__/mocks/atobarai/api/mocked-atobarai-api-client";
import { mockedAtobaraiTransactionId } from "@/__tests__/mocks/atobarai/mocked-atobarai-transaction-id";
import { OrderGrantedRefundFragment, SourceObjectFragment } from "@/generated/graphql";
import { createAtobaraiCancelTransactionSuccessResponse } from "@/modules/atobarai/api/atobarai-cancel-transaction-success-response";

import {
  NoFulfillmentFullRefundStrategy,
  NoFulfillmentPartialRefundWithLineItemsStrategy,
  NoFulfillmentPartialRefundWithoutLineItemsStrategy,
} from "./refund-strategies";
import { RefundContext } from "./refund-strategy";
import { TransactionRefundRequestedUseCaseResponse } from "./use-case-response";

describe("Refund Strategies", () => {
  const mockContext: RefundContext = {
    parsedEvent: {
      refundedAmount: 100,
      sourceObjectTotalAmount: 200,
      channelId: "channel-1",
      pspReference: "psp-ref",
      transactionToken: "token",
      issuedAt: "2023-01-01T00:00:00Z",
      sourceObject: {} as SourceObjectFragment,
      grantedRefund: null,
      currency: "JPY",
    },
    appConfig: mockedAppChannelConfig,
    atobaraiTransactionId: mockedAtobaraiTransactionId,
    apiClient: mockedAtobaraiApiClient,
    hasFulfillmentReported: false,
  };

  describe("NoFulfillmentFullRefundStrategy", () => {
    let strategy: NoFulfillmentFullRefundStrategy;

    beforeEach(() => {
      strategy = new NoFulfillmentFullRefundStrategy();
    });

    it("should handle full refund when amounts are equal and fulfillment not reported", () => {
      const context = {
        ...mockContext,
        parsedEvent: {
          ...mockContext.parsedEvent,
          refundedAmount: 200,
          sourceObjectTotalAmount: 200,
        },
        hasFulfillmentReported: false,
      };

      expect(strategy.canHandle(context)).toBe(true);
    });

    it("should not handle full refund when fulfillment has been reported", () => {
      const context = {
        ...mockContext,
        parsedEvent: {
          ...mockContext.parsedEvent,
          refundedAmount: 200,
          sourceObjectTotalAmount: 200,
        },
        hasFulfillmentReported: true,
      };

      expect(strategy.canHandle(context)).toBe(false);
    });

    it("should not handle partial refund", () => {
      const context = {
        ...mockContext,
        parsedEvent: {
          ...mockContext.parsedEvent,
          refundedAmount: 100,
          sourceObjectTotalAmount: 200,
        },
        hasFulfillmentReported: false,
      };

      expect(strategy.canHandle(context)).toBe(false);
    });

    it("should execute full refund successfully", async () => {
      const context = {
        ...mockContext,
        parsedEvent: {
          ...mockContext.parsedEvent,
          refundedAmount: 200,
          sourceObjectTotalAmount: 200,
        },
      };

      const mockResponse = createAtobaraiCancelTransactionSuccessResponse({
        results: [{ np_transaction_id: mockedAtobaraiTransactionId }],
      });

      mockedAtobaraiApiClient.cancelTransaction.mockResolvedValue(ok(mockResponse));

      const result = await strategy.execute(context);

      expect(result.isOk()).toBe(true);
      if (result.isOk()) {
        expect(result.value).toBeInstanceOf(TransactionRefundRequestedUseCaseResponse.Success);
      }
      expect(mockedAtobaraiApiClient.cancelTransaction).toHaveBeenCalledTimes(1);
    });
  });

  describe("NoFulfillmentPartialRefundWithLineItemsStrategy", () => {
    let strategy: NoFulfillmentPartialRefundWithLineItemsStrategy;

    beforeEach(() => {
      strategy = new NoFulfillmentPartialRefundWithLineItemsStrategy();
    });

    it("should handle partial refund with line items when fulfillment not reported", () => {
      const context = {
        ...mockContext,
        parsedEvent: {
          ...mockContext.parsedEvent,
          refundedAmount: 100,
          sourceObjectTotalAmount: 200,
          grantedRefund: {
            lines: [],
            shippingCostsIncluded: false,
          } satisfies OrderGrantedRefundFragment,
        },
        hasFulfillmentReported: false,
      };

      expect(strategy.canHandle(context)).toBe(true);
    });

    it("should not handle partial refund with line items when fulfillment has been reported", () => {
      const context = {
        ...mockContext,
        parsedEvent: {
          ...mockContext.parsedEvent,
          refundedAmount: 100,
          sourceObjectTotalAmount: 200,
          grantedRefund: null,
        },
        hasFulfillmentReported: true,
      };

      expect(strategy.canHandle(context)).toBe(false);
    });

    it("should not handle full refund", () => {
      const context = {
        ...mockContext,
        parsedEvent: {
          ...mockContext.parsedEvent,
          refundedAmount: 200,
          sourceObjectTotalAmount: 200,
          grantedRefund: null,
        },
        hasFulfillmentReported: false,
      };

      expect(strategy.canHandle(context)).toBe(false);
    });

    it("should not handle partial refund without line items", () => {
      const context = {
        ...mockContext,
        parsedEvent: {
          ...mockContext.parsedEvent,
          refundedAmount: 100,
          sourceObjectTotalAmount: 200,
          grantedRefund: null,
        },
        hasFulfillmentReported: false,
      };

      expect(strategy.canHandle(context)).toBe(false);
    });
  });

  describe("NoFulfillmentPartialRefundWithoutLineItemsStrategy", () => {
    let strategy: NoFulfillmentPartialRefundWithoutLineItemsStrategy;

    beforeEach(() => {
      strategy = new NoFulfillmentPartialRefundWithoutLineItemsStrategy();
    });

    it("should handle partial refund without line items when fulfillment not reported", () => {
      const context = {
        ...mockContext,
        parsedEvent: {
          ...mockContext.parsedEvent,
          refundedAmount: 100,
          sourceObjectTotalAmount: 200,
          grantedRefund: null,
        },
        hasFulfillmentReported: false,
      };

      expect(strategy.canHandle(context)).toBe(true);
    });

    it("should not handle partial refund without line items when fulfillment has been reported", () => {
      const context = {
        ...mockContext,
        parsedEvent: {
          ...mockContext.parsedEvent,
          refundedAmount: 100,
          sourceObjectTotalAmount: 200,
          grantedRefund: null,
        },
        hasFulfillmentReported: true,
      };

      expect(strategy.canHandle(context)).toBe(false);
    });

    it("should not handle full refund", () => {
      const context = {
        ...mockContext,
        parsedEvent: {
          ...mockContext.parsedEvent,
          refundedAmount: 200,
          sourceObjectTotalAmount: 200,
          grantedRefund: null,
        },
        hasFulfillmentReported: false,
      };

      expect(strategy.canHandle(context)).toBe(false);
    });

    it("should not handle partial refund with line items", () => {
      const context = {
        ...mockContext,
        parsedEvent: {
          ...mockContext.parsedEvent,
          refundedAmount: 100,
          sourceObjectTotalAmount: 200,
          grantedRefund: {
            lines: [],
            shippingCostsIncluded: false,
          } satisfies OrderGrantedRefundFragment,
        },
        hasFulfillmentReported: false,
      };

      expect(strategy.canHandle(context)).toBe(false);
    });
  });
});
