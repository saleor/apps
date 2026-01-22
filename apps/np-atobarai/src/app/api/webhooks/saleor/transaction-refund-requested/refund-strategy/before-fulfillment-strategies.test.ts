import { err, ok } from "neverthrow";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { mockedAppChannelConfig } from "@/__tests__/mocks/app-config/mocked-app-config";
import { mockedAtobaraiApiClient } from "@/__tests__/mocks/atobarai/api/mocked-atobarai-api-client";
import { mockedAtobaraiTransactionId } from "@/__tests__/mocks/atobarai/mocked-atobarai-transaction-id";
import { mockedSourceObject } from "@/__tests__/mocks/saleor-events/mocked-source-object";
import { OrderGrantedRefundFragment } from "@/generated/graphql";
import { createAtobaraiCancelTransactionSuccessResponse } from "@/modules/atobarai/api/atobarai-cancel-transaction-success-response";
import { createAtobaraiTransactionSuccessResponse } from "@/modules/atobarai/api/atobarai-transaction-success-response";
import {
  AtobaraiApiClientCancelTransactionError,
  AtobaraiApiClientChangeTransactionError,
} from "@/modules/atobarai/api/types";

import { TransactionRefundRequestedUseCaseResponse } from "../use-case-response";
import {
  BeforeFulfillmentFullRefundStrategy,
  BeforeFulfillmentPartialRefundWithLineItemsStrategy,
  BeforeFulfillmentPartialRefundWithoutLineItemsStrategy,
} from "./before-fulfillment-strategies";
import { BeforeFulfillmentRefundContext } from "./types";

const baseContext = {
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
    transactionTotalCharged: 200,
  },
  appConfig: mockedAppChannelConfig,
  atobaraiTransactionId: mockedAtobaraiTransactionId,
  apiClient: mockedAtobaraiApiClient,
} satisfies BeforeFulfillmentRefundContext;

beforeEach(() => {
  vi.clearAllMocks();
});

describe("BeforeFulfillmentFullRefundStrategy", () => {
  let strategy: BeforeFulfillmentFullRefundStrategy;

  beforeEach(() => {
    strategy = new BeforeFulfillmentFullRefundStrategy();
  });

  it("should execute full refund successfully", async () => {
    const context: BeforeFulfillmentRefundContext = {
      ...baseContext,
      parsedEvent: {
        ...baseContext.parsedEvent,
        refundedAmount: 200,
        sourceObjectTotalAmount: 200,
      },
    };

    const mockResponse = createAtobaraiCancelTransactionSuccessResponse({
      results: [{ np_transaction_id: mockedAtobaraiTransactionId }],
    });

    mockedAtobaraiApiClient.cancelTransaction.mockResolvedValue(ok(mockResponse));

    const result = await strategy.execute(context);

    const value = result._unsafeUnwrap();

    expect(value).toBeInstanceOf(TransactionRefundRequestedUseCaseResponse.Success);
    expect(mockedAtobaraiApiClient.cancelTransaction).toHaveBeenCalledTimes(1);
    expect(mockedAtobaraiApiClient.cancelTransaction).toHaveBeenCalledWith(
      {
        transactions: [
          {
            np_transaction_id: mockedAtobaraiTransactionId,
          },
        ],
      },
      {
        rejectMultipleResults: true,
      },
    );
  });

  it("should handle API client error gracefully", async () => {
    const context: BeforeFulfillmentRefundContext = {
      ...baseContext,
      parsedEvent: {
        ...baseContext.parsedEvent,
        refundedAmount: 200,
        sourceObjectTotalAmount: 200,
      },
    };

    const apiError = new AtobaraiApiClientCancelTransactionError("API Error");

    mockedAtobaraiApiClient.cancelTransaction.mockResolvedValue(err(apiError));

    const result = await strategy.execute(context);

    expect(result._unsafeUnwrap()).toBeInstanceOf(
      TransactionRefundRequestedUseCaseResponse.Failure,
    );
  });
});

describe("BeforeFulfillmentPartialRefundWithLineItemsStrategy", () => {
  let strategy: BeforeFulfillmentPartialRefundWithLineItemsStrategy;

  beforeEach(() => {
    strategy = new BeforeFulfillmentPartialRefundWithLineItemsStrategy();
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

    const context: BeforeFulfillmentRefundContext = {
      ...baseContext,
      parsedEvent: {
        ...baseContext.parsedEvent,
        refundedAmount: 100,
        sourceObjectTotalAmount: 200,
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

    const context: BeforeFulfillmentRefundContext = {
      ...baseContext,
      parsedEvent: {
        ...baseContext.parsedEvent,
        refundedAmount: 100,
        sourceObjectTotalAmount: 200,
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
});

describe("BeforeFulfillmentPartialRefundWithoutLineItemsStrategy", () => {
  let strategy: BeforeFulfillmentPartialRefundWithoutLineItemsStrategy;

  beforeEach(() => {
    strategy = new BeforeFulfillmentPartialRefundWithoutLineItemsStrategy();
  });

  it("should execute partial refund without line items successfully", async () => {
    const context: BeforeFulfillmentRefundContext = {
      ...baseContext,
      parsedEvent: {
        ...baseContext.parsedEvent,
        refundedAmount: 100,
        sourceObjectTotalAmount: 200,
        grantedRefund: null,
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

  it("should handle API client error gracefully", async () => {
    const context: BeforeFulfillmentRefundContext = {
      ...baseContext,
      parsedEvent: {
        ...baseContext.parsedEvent,
        refundedAmount: 100,
        sourceObjectTotalAmount: 200,
        grantedRefund: null,
      },
    };

    const apiError = new AtobaraiApiClientChangeTransactionError("API Error");

    mockedAtobaraiApiClient.changeTransaction.mockResolvedValue(err(apiError));

    const result = await strategy.execute(context);

    expect(result._unsafeUnwrap()).toBeInstanceOf(
      TransactionRefundRequestedUseCaseResponse.Failure,
    );
  });

  it("should calculate adjusted amount correctly for different refund amounts", async () => {
    const context: BeforeFulfillmentRefundContext = {
      ...baseContext,
      parsedEvent: {
        ...baseContext.parsedEvent,
        refundedAmount: 50,
        sourceObjectTotalAmount: 150,
        currency: "JPY", // Only JPY is supported
        grantedRefund: null,
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

    // Verify the payload contains adjusted amount
    const callArgs = mockedAtobaraiApiClient.changeTransaction.mock.calls[0][0];
    const expectedAmount =
      context.parsedEvent.sourceObjectTotalAmount - context.parsedEvent.refundedAmount;

    expect(callArgs.transactions[0].billed_amount).toBe(expectedAmount);
  });
});
