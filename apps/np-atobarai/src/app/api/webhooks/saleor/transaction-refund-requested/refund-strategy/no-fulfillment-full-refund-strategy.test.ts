import { err, ok } from "neverthrow";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { mockedAppChannelConfig } from "@/__tests__/mocks/app-config/mocked-app-config";
import { mockedAtobaraiApiClient } from "@/__tests__/mocks/atobarai/api/mocked-atobarai-api-client";
import { mockedAtobaraiTransactionId } from "@/__tests__/mocks/atobarai/mocked-atobarai-transaction-id";
import { mockedSourceObject } from "@/__tests__/mocks/saleor-events/mocked-source-object";
import { createAtobaraiCancelTransactionSuccessResponse } from "@/modules/atobarai/api/atobarai-cancel-transaction-success-response";
import { AtobaraiApiClientCancelTransactionError } from "@/modules/atobarai/api/types";

import { TransactionRefundRequestedUseCaseResponse } from "../use-case-response";
import { NoFulfillmentFullRefundStrategy } from "./no-fulfillment-full-refund-strategy";
import { NonFulfillmentRefundContext } from "./types";

describe("NoFulfillmentFullRefundStrategy", () => {
  let strategy: NoFulfillmentFullRefundStrategy;

  const baseContext: NonFulfillmentRefundContext = {
    parsedEvent: {
      refundedAmount: 200,
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
    strategy = new NoFulfillmentFullRefundStrategy();
  });

  it("should execute full refund successfully", async () => {
    const mockResponse = createAtobaraiCancelTransactionSuccessResponse({
      results: [{ np_transaction_id: mockedAtobaraiTransactionId }],
    });

    mockedAtobaraiApiClient.cancelTransaction.mockResolvedValue(ok(mockResponse));

    const result = await strategy.execute(baseContext);

    expect(result.isOk()).toBe(true);
    const value = result._unsafeUnwrap();

    expect(value).toBeInstanceOf(TransactionRefundRequestedUseCaseResponse.Success);
    expect(mockedAtobaraiApiClient.cancelTransaction).toHaveBeenCalledTimes(1);
    expect(mockedAtobaraiApiClient.cancelTransaction).toHaveBeenCalledWith({
      transactions: [
        {
          np_transaction_id: mockedAtobaraiTransactionId,
        },
      ],
    });
  });

  it("should handle API client error gracefully", async () => {
    const apiError = new AtobaraiApiClientCancelTransactionError("API Error");

    mockedAtobaraiApiClient.cancelTransaction.mockResolvedValue(err(apiError));

    const result = await strategy.execute(baseContext);

    expect(result._unsafeUnwrap()).toBeInstanceOf(
      TransactionRefundRequestedUseCaseResponse.Failure,
    );
  });

  it("should handle multiple results as failure", async () => {
    const mockResponse = createAtobaraiCancelTransactionSuccessResponse({
      results: [
        { np_transaction_id: mockedAtobaraiTransactionId },
        { np_transaction_id: mockedAtobaraiTransactionId },
      ],
    });

    mockedAtobaraiApiClient.cancelTransaction.mockResolvedValue(ok(mockResponse));

    const result = await strategy.execute(baseContext);

    expect(result._unsafeUnwrap()).toBeInstanceOf(
      TransactionRefundRequestedUseCaseResponse.Failure,
    );
  });
});
