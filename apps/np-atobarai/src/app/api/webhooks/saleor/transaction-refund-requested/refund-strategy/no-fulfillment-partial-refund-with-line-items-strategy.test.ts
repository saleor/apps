import { err, ok } from "neverthrow";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { mockedAppChannelConfig } from "@/__tests__/mocks/app-config/mocked-app-config";
import { mockedAtobaraiApiClient } from "@/__tests__/mocks/atobarai/api/mocked-atobarai-api-client";
import { mockedAtobaraiTransactionId } from "@/__tests__/mocks/atobarai/mocked-atobarai-transaction-id";
import { mockedSourceObject } from "@/__tests__/mocks/saleor-events/mocked-source-object";
import { OrderGrantedRefundFragment } from "@/generated/graphql";
import { createAtobaraiTransactionSuccessResponse } from "@/modules/atobarai/api/atobarai-transaction-success-response";
import { AtobaraiApiClientChangeTransactionError } from "@/modules/atobarai/api/types";

import { TransactionRefundRequestedUseCaseResponse } from "../use-case-response";
import { NoFulfillmentPartialRefundWithLineItemsStrategy } from "./no-fulfillment-partial-refund-with-line-items-strategy";
import { NonFulfillmentRefundContext } from "./types";

describe("NoFulfillmentPartialRefundWithLineItemsStrategy", () => {
  let strategy: NoFulfillmentPartialRefundWithLineItemsStrategy;

  const baseContext: NonFulfillmentRefundContext = {
    parsedEvent: {
      refundedAmount: 100,
      sourceObjectTotalAmount: 200,
      channelId: "channel-1",
      pspReference: "psp-ref",
      transactionToken: "token",
      issuedAt: "2023-01-01T00:00:00Z",
      sourceObject: mockedSourceObject,
      grantedRefund: null,
      currency: "JPY",
    },
    appConfig: mockedAppChannelConfig,
    atobaraiTransactionId: mockedAtobaraiTransactionId,
    apiClient: mockedAtobaraiApiClient,
    hasFulfillmentReported: false,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    strategy = new NoFulfillmentPartialRefundWithLineItemsStrategy();
  });

  it("should execute partial refund with line items successfully", async () => {
    const grantedRefund: OrderGrantedRefundFragment = {
      lines: [
        {
          orderLine: {
            id: "line-1",
          },
          quantity: 1,
        },
      ],
      shippingCostsIncluded: false,
    };

    const context: NonFulfillmentRefundContext = {
      ...baseContext,
      parsedEvent: {
        ...baseContext.parsedEvent,
        grantedRefund,
      },
    };

    const mockResponse = createAtobaraiTransactionSuccessResponse({
      results: [
        {
          np_transaction_id: mockedAtobaraiTransactionId,
          authori_result: "00",
        },
      ],
    });

    mockedAtobaraiApiClient.changeTransaction.mockResolvedValue(ok(mockResponse));

    const result = await strategy.execute(context);

    expect(result._unsafeUnwrap()).toBeInstanceOf(
      TransactionRefundRequestedUseCaseResponse.Success,
    );
    expect(mockedAtobaraiApiClient.changeTransaction).toHaveBeenCalledTimes(1);

    // Verify the payload contains adjusted amount (total - refunded)
    const callArgs = mockedAtobaraiApiClient.changeTransaction.mock.calls[0][0];
    const expectedAmount =
      context.parsedEvent.sourceObjectTotalAmount - context.parsedEvent.refundedAmount;

    expect(callArgs.transactions[0].billed_amount).toBe(expectedAmount);
  });

  it("should fail when no granted refund is provided", async () => {
    const context: NonFulfillmentRefundContext = {
      ...baseContext,
      parsedEvent: {
        ...baseContext.parsedEvent,
        grantedRefund: null,
      },
    };

    const result = await strategy.execute(context);

    expect(result._unsafeUnwrap()).toBeInstanceOf(
      TransactionRefundRequestedUseCaseResponse.Failure,
    );
    expect(mockedAtobaraiApiClient.changeTransaction).not.toHaveBeenCalled();
  });

  it("should handle API client error gracefully", async () => {
    const grantedRefund: OrderGrantedRefundFragment = {
      lines: [
        {
          orderLine: {
            id: "line-1",
          },
          quantity: 1,
        },
      ],
      shippingCostsIncluded: false,
    };

    const context: NonFulfillmentRefundContext = {
      ...baseContext,
      parsedEvent: {
        ...baseContext.parsedEvent,
        grantedRefund,
      },
    };

    const apiError = new AtobaraiApiClientChangeTransactionError("API Error");

    mockedAtobaraiApiClient.changeTransaction.mockResolvedValue(err(apiError));

    const result = await strategy.execute(context);

    expect(result._unsafeUnwrap()).toBeInstanceOf(
      TransactionRefundRequestedUseCaseResponse.Failure,
    );
  });

  it("should handle multiple results as failure", async () => {
    const grantedRefund: OrderGrantedRefundFragment = {
      lines: [
        {
          orderLine: {
            id: "line-1",
          },
          quantity: 1,
        },
      ],
      shippingCostsIncluded: false,
    };

    const context: NonFulfillmentRefundContext = {
      ...baseContext,
      parsedEvent: {
        ...baseContext.parsedEvent,
        grantedRefund,
      },
    };

    const mockResponse = createAtobaraiTransactionSuccessResponse({
      results: [
        {
          np_transaction_id: mockedAtobaraiTransactionId,
          authori_result: "00",
        },
        {
          np_transaction_id: mockedAtobaraiTransactionId,
          authori_result: "00",
        },
      ],
    });

    mockedAtobaraiApiClient.changeTransaction.mockResolvedValue(ok(mockResponse));

    const result = await strategy.execute(context);

    expect(result._unsafeUnwrap()).toBeInstanceOf(
      TransactionRefundRequestedUseCaseResponse.Failure,
    );
  });
});
