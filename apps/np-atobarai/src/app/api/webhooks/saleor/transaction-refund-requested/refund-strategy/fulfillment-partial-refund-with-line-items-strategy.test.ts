import { err, ok } from "neverthrow";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { mockedAppChannelConfig } from "@/__tests__/mocks/app-config/mocked-app-config";
import { mockedAtobaraiApiClient } from "@/__tests__/mocks/atobarai/api/mocked-atobarai-api-client";
import { mockedAtobaraiShippingCompanyCode } from "@/__tests__/mocks/atobarai/mocked-atobarai-shipping-compnay-code";
import { mockedAtobaraiTransactionId } from "@/__tests__/mocks/atobarai/mocked-atobarai-transaction-id";
import { mockedSourceObject } from "@/__tests__/mocks/saleor-events/mocked-source-object";
import { OrderGrantedRefundFragment } from "@/generated/graphql";
import { createAtobaraiCancelTransactionSuccessResponse } from "@/modules/atobarai/api/atobarai-cancel-transaction-success-response";
import { createAtobaraiFulfillmentReportSuccessResponse } from "@/modules/atobarai/api/atobarai-fulfillment-report-success-response";
import { createAtobaraiTransactionSuccessResponse } from "@/modules/atobarai/api/atobarai-transaction-success-response";
import {
  AtobaraiApiClientCancelTransactionError,
  AtobaraiApiClientFulfillmentReportError,
  AtobaraiApiClientRegisterTransactionError,
} from "@/modules/atobarai/api/types";

import { TransactionRefundRequestedUseCaseResponse } from "../use-case-response";
import { FulfillmentPartialRefundWithLineItemsStrategy } from "./fulfillment-partial-refund-with-line-items-strategy";
import { FulfillmentRefundContext } from "./types";

describe("FulfillmentPartialRefundWithLineItemsStrategy", () => {
  let strategy: FulfillmentPartialRefundWithLineItemsStrategy;

  const baseContext: FulfillmentRefundContext = {
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
    trackingNumber: "TRACK123",
    shippingCompanyCode: mockedAtobaraiShippingCompanyCode,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    strategy = new FulfillmentPartialRefundWithLineItemsStrategy();
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

    const context: FulfillmentRefundContext = {
      ...baseContext,
      parsedEvent: {
        ...baseContext.parsedEvent,
        grantedRefund,
      },
    };

    const mockCancelResponse = createAtobaraiCancelTransactionSuccessResponse({
      results: [{ np_transaction_id: mockedAtobaraiTransactionId }],
    });

    const mockRegisterResponse = createAtobaraiTransactionSuccessResponse({
      results: [
        {
          np_transaction_id: "new_trans_1",
          authori_result: "00",
        },
      ],
    });

    const mockFulfillmentResponse = createAtobaraiFulfillmentReportSuccessResponse({
      results: [{ np_transaction_id: "new_trans_1" }],
    });

    mockedAtobaraiApiClient.cancelTransaction.mockResolvedValue(ok(mockCancelResponse));
    mockedAtobaraiApiClient.registerTransaction.mockResolvedValue(ok(mockRegisterResponse));
    mockedAtobaraiApiClient.reportFulfillment.mockResolvedValue(ok(mockFulfillmentResponse));

    const result = await strategy.execute(context);

    expect(result._unsafeUnwrap()).toBeInstanceOf(
      TransactionRefundRequestedUseCaseResponse.Success,
    );
    expect(mockedAtobaraiApiClient.cancelTransaction).toHaveBeenCalledTimes(1);
    expect(mockedAtobaraiApiClient.registerTransaction).toHaveBeenCalledTimes(1);
    expect(mockedAtobaraiApiClient.reportFulfillment).toHaveBeenCalledTimes(1);

    // Verify the register payload contains adjusted amount (total - refunded)
    const registerCallArgs = mockedAtobaraiApiClient.registerTransaction.mock.calls[0][0];
    const expectedAmount =
      context.parsedEvent.sourceObjectTotalAmount - context.parsedEvent.refundedAmount;

    expect(registerCallArgs.transactions[0].billed_amount).toBe(expectedAmount);
  });

  it("should handle cancel transaction API error gracefully", async () => {
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

    const context: FulfillmentRefundContext = {
      ...baseContext,
      parsedEvent: {
        ...baseContext.parsedEvent,
        grantedRefund,
      },
    };

    const apiError = new AtobaraiApiClientCancelTransactionError("Cancel API Error");

    mockedAtobaraiApiClient.cancelTransaction.mockResolvedValue(err(apiError));

    const result = await strategy.execute(context);

    expect(result._unsafeUnwrap()).toBeInstanceOf(
      TransactionRefundRequestedUseCaseResponse.Failure,
    );
    expect(mockedAtobaraiApiClient.registerTransaction).not.toHaveBeenCalled();
    expect(mockedAtobaraiApiClient.reportFulfillment).not.toHaveBeenCalled();
  });

  it("should handle register transaction API error gracefully", async () => {
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

    const context: FulfillmentRefundContext = {
      ...baseContext,
      parsedEvent: {
        ...baseContext.parsedEvent,
        grantedRefund,
      },
    };

    const mockCancelResponse = createAtobaraiCancelTransactionSuccessResponse({
      results: [{ np_transaction_id: mockedAtobaraiTransactionId }],
    });

    const apiError = new AtobaraiApiClientRegisterTransactionError("Register API Error");

    mockedAtobaraiApiClient.cancelTransaction.mockResolvedValue(ok(mockCancelResponse));
    mockedAtobaraiApiClient.registerTransaction.mockResolvedValue(err(apiError));

    const result = await strategy.execute(context);

    expect(result._unsafeUnwrap()).toBeInstanceOf(
      TransactionRefundRequestedUseCaseResponse.Failure,
    );
    expect(mockedAtobaraiApiClient.reportFulfillment).not.toHaveBeenCalled();
  });

  it("should handle report fulfillment API error gracefully", async () => {
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

    const context: FulfillmentRefundContext = {
      ...baseContext,
      parsedEvent: {
        ...baseContext.parsedEvent,
        grantedRefund,
      },
    };

    const mockCancelResponse = createAtobaraiCancelTransactionSuccessResponse({
      results: [{ np_transaction_id: mockedAtobaraiTransactionId }],
    });

    const mockRegisterResponse = createAtobaraiTransactionSuccessResponse({
      results: [
        {
          np_transaction_id: "new_trans_1",
          authori_result: "00",
        },
      ],
    });

    const apiError = new AtobaraiApiClientFulfillmentReportError("Fulfillment API Error");

    mockedAtobaraiApiClient.cancelTransaction.mockResolvedValue(ok(mockCancelResponse));
    mockedAtobaraiApiClient.registerTransaction.mockResolvedValue(ok(mockRegisterResponse));
    mockedAtobaraiApiClient.reportFulfillment.mockResolvedValue(err(apiError));

    const result = await strategy.execute(context);

    expect(result._unsafeUnwrap()).toBeInstanceOf(
      TransactionRefundRequestedUseCaseResponse.Failure,
    );
  });

  it("should handle multiple results from cancel transaction as failure", async () => {
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

    const context: FulfillmentRefundContext = {
      ...baseContext,
      parsedEvent: {
        ...baseContext.parsedEvent,
        grantedRefund,
      },
    };

    const mockCancelResponse = createAtobaraiCancelTransactionSuccessResponse({
      results: [
        { np_transaction_id: mockedAtobaraiTransactionId },
        { np_transaction_id: mockedAtobaraiTransactionId },
      ],
    });

    mockedAtobaraiApiClient.cancelTransaction.mockResolvedValue(ok(mockCancelResponse));

    const result = await strategy.execute(context);

    expect(result._unsafeUnwrap()).toBeInstanceOf(
      TransactionRefundRequestedUseCaseResponse.Failure,
    );
    expect(mockedAtobaraiApiClient.registerTransaction).not.toHaveBeenCalled();
  });

  it("should handle multiple results from register transaction as failure", async () => {
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

    const context: FulfillmentRefundContext = {
      ...baseContext,
      parsedEvent: {
        ...baseContext.parsedEvent,
        grantedRefund,
      },
    };

    const mockCancelResponse = createAtobaraiCancelTransactionSuccessResponse({
      results: [{ np_transaction_id: mockedAtobaraiTransactionId }],
    });

    const mockRegisterResponse = createAtobaraiTransactionSuccessResponse({
      results: [
        {
          np_transaction_id: "new_trans_1",
          authori_result: "00",
        },
        {
          np_transaction_id: "new_trans_2",
          authori_result: "00",
        },
      ],
    });

    mockedAtobaraiApiClient.cancelTransaction.mockResolvedValue(ok(mockCancelResponse));
    mockedAtobaraiApiClient.registerTransaction.mockResolvedValue(ok(mockRegisterResponse));

    const result = await strategy.execute(context);

    expect(result._unsafeUnwrap()).toBeInstanceOf(
      TransactionRefundRequestedUseCaseResponse.Failure,
    );
    expect(mockedAtobaraiApiClient.reportFulfillment).not.toHaveBeenCalled();
  });

  it("should handle multiple results from report fulfillment as failure", async () => {
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

    const context: FulfillmentRefundContext = {
      ...baseContext,
      parsedEvent: {
        ...baseContext.parsedEvent,
        grantedRefund,
      },
    };

    const mockCancelResponse = createAtobaraiCancelTransactionSuccessResponse({
      results: [{ np_transaction_id: mockedAtobaraiTransactionId }],
    });

    const mockRegisterResponse = createAtobaraiTransactionSuccessResponse({
      results: [
        {
          np_transaction_id: "new_trans_1",
          authori_result: "00",
        },
      ],
    });

    const mockFulfillmentResponse = createAtobaraiFulfillmentReportSuccessResponse({
      results: [{ np_transaction_id: "new_trans_1" }, { np_transaction_id: "new_trans_2" }],
    });

    mockedAtobaraiApiClient.cancelTransaction.mockResolvedValue(ok(mockCancelResponse));
    mockedAtobaraiApiClient.registerTransaction.mockResolvedValue(ok(mockRegisterResponse));
    mockedAtobaraiApiClient.reportFulfillment.mockResolvedValue(ok(mockFulfillmentResponse));

    const result = await strategy.execute(context);

    expect(result._unsafeUnwrap()).toBeInstanceOf(
      TransactionRefundRequestedUseCaseResponse.Failure,
    );
  });
});
