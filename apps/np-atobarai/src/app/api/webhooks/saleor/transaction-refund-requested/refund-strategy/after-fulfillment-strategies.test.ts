import { err, ok } from "neverthrow";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { mockedAppChannelConfig } from "@/__tests__/mocks/app-config/mocked-app-config";
import { mockedAtobaraiApiClient } from "@/__tests__/mocks/atobarai/api/mocked-atobarai-api-client";
import { mockedAtobaraiShippingCompanyCode } from "@/__tests__/mocks/atobarai/mocked-atobarai-shipping-company-code";
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
import {
  AfterFulfillmentFullRefundStrategy,
  AfterFulfillmentPartialRefundWithLineItemsStrategy,
  AfterFulfillmentPartialRefundWithoutLineItemsStrategy,
} from "./after-fulfillment-strategies";
import { AfterFulfillmentRefundContext } from "./types";

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
  trackingNumber: "1234567890",
  shippingCompanyCode: mockedAtobaraiShippingCompanyCode,
} satisfies AfterFulfillmentRefundContext;

beforeEach(() => {
  vi.clearAllMocks();
});

describe("AfterFulfillmentFullRefundStrategy", () => {
  let strategy: AfterFulfillmentFullRefundStrategy;

  beforeEach(() => {
    strategy = new AfterFulfillmentFullRefundStrategy();
  });

  it("should execute full refund successfully", async () => {
    const context: AfterFulfillmentRefundContext = {
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

    expect(result._unsafeUnwrap()).toBeInstanceOf(
      TransactionRefundRequestedUseCaseResponse.Success,
    );
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
    const context: AfterFulfillmentRefundContext = {
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

    expect(result._unsafeUnwrap().transactionResult.message).toContain(
      "canceling transaction failed",
    );
  });
});

describe("AfterFulfillmentPartialRefundWithLineItemsStrategy", () => {
  let strategy: AfterFulfillmentPartialRefundWithLineItemsStrategy;

  beforeEach(() => {
    strategy = new AfterFulfillmentPartialRefundWithLineItemsStrategy();
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

    const context: AfterFulfillmentRefundContext = {
      ...baseContext,
      parsedEvent: {
        ...baseContext.parsedEvent,
        refundedAmount: 100,
        sourceObjectTotalAmount: 200,
        grantedRefund,
      },
    };

    const mockCancelResponse = createAtobaraiCancelTransactionSuccessResponse({
      results: [{ np_transaction_id: mockedAtobaraiTransactionId }],
    });

    const mockRegisterResponse = createAtobaraiTransactionSuccessResponse({
      results: [
        {
          np_transaction_id: "12345678901",
          authori_result: "00",
        },
      ],
    });

    const mockFulfillmentResponse = createAtobaraiFulfillmentReportSuccessResponse({
      results: [{ np_transaction_id: "12345678901" }],
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

    const registerCallArgs = mockedAtobaraiApiClient.registerTransaction.mock.calls[0][0];
    const expectedAmount =
      context.parsedEvent.sourceObjectTotalAmount - context.parsedEvent.refundedAmount;

    expect(registerCallArgs.transactions[0].billed_amount).toBe(expectedAmount);

    const fulfillmentCallArgs = mockedAtobaraiApiClient.reportFulfillment.mock.calls[0][0];

    expect(fulfillmentCallArgs.transactions[0]).toMatchInlineSnapshot(`
        {
          "np_transaction_id": "12345678901",
          "pd_company_code": "50000",
          "slip_no": "1234567890",
        }
      `);
  });

  it("should handle missing granted refund", async () => {
    const context: AfterFulfillmentRefundContext = {
      ...baseContext,
      parsedEvent: {
        ...baseContext.parsedEvent,
        grantedRefund: null,
      },
    };

    const result = await strategy.execute(context);

    expect(result.isOk()).toBe(true);

    expect(result._unsafeUnwrap()).toBeInstanceOf(
      TransactionRefundRequestedUseCaseResponse.Failure,
    );

    expect(result._unsafeUnwrap().transactionResult.message).toContain("missing required data");

    expect(mockedAtobaraiApiClient.cancelTransaction).not.toHaveBeenCalled();
    expect(mockedAtobaraiApiClient.registerTransaction).not.toHaveBeenCalled();
    expect(mockedAtobaraiApiClient.reportFulfillment).not.toHaveBeenCalled();
  });

  it("should handle cancel transaction API error", async () => {
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

    const context: AfterFulfillmentRefundContext = {
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

    expect(result._unsafeUnwrap().transactionResult.message).toContain(
      "canceling transaction failed",
    );

    expect(mockedAtobaraiApiClient.registerTransaction).not.toHaveBeenCalled();
    expect(mockedAtobaraiApiClient.reportFulfillment).not.toHaveBeenCalled();
  });

  it("should handle register transaction API error", async () => {
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

    const context: AfterFulfillmentRefundContext = {
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

    expect(result._unsafeUnwrap()).toBeInstanceOf(
      TransactionRefundRequestedUseCaseResponse.Failure,
    );

    expect(result._unsafeUnwrap().transactionResult.message).toContain(
      "re-registering transaction failed",
    );

    expect(mockedAtobaraiApiClient.reportFulfillment).not.toHaveBeenCalled();
  });

  it("should handle register transaction unsuccessful result", async () => {
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

    const context: AfterFulfillmentRefundContext = {
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
          np_transaction_id: "12345678901",
          authori_result: "20", // Failed
          authori_ng: "RE001", // Required for failed transactions
        },
      ],
    });

    mockedAtobaraiApiClient.cancelTransaction.mockResolvedValue(ok(mockCancelResponse));
    mockedAtobaraiApiClient.registerTransaction.mockResolvedValue(ok(mockRegisterResponse));

    const result = await strategy.execute(context);

    expect(result._unsafeUnwrap()).toBeInstanceOf(
      TransactionRefundRequestedUseCaseResponse.Failure,
    );

    expect(result._unsafeUnwrap().transactionResult.message).toContain(
      "re-registering transaction failed",
    );

    expect(mockedAtobaraiApiClient.reportFulfillment).not.toHaveBeenCalled();
  });

  it("should handle fulfillment report API error", async () => {
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

    const context: AfterFulfillmentRefundContext = {
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
          np_transaction_id: "12345678901",
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

    expect(result._unsafeUnwrap().transactionResult.message).toContain(
      "fulfilling transaction failed",
    );
  });
});

describe("AfterFulfillmentPartialRefundWithoutLineItemsStrategy", () => {
  let strategy: AfterFulfillmentPartialRefundWithoutLineItemsStrategy;

  beforeEach(() => {
    strategy = new AfterFulfillmentPartialRefundWithoutLineItemsStrategy();
  });

  it("should execute partial refund without line items successfully", async () => {
    const context: AfterFulfillmentRefundContext = {
      ...baseContext,
      parsedEvent: {
        ...baseContext.parsedEvent,
        refundedAmount: 100,
        sourceObjectTotalAmount: 200,
        grantedRefund: null,
      },
    };

    const mockCancelResponse = createAtobaraiCancelTransactionSuccessResponse({
      results: [{ np_transaction_id: mockedAtobaraiTransactionId }],
    });

    const mockRegisterResponse = createAtobaraiTransactionSuccessResponse({
      results: [
        {
          np_transaction_id: "12345678901",
          authori_result: "00",
        },
      ],
    });

    const mockFulfillmentResponse = createAtobaraiFulfillmentReportSuccessResponse({
      results: [{ np_transaction_id: "12345678901" }],
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

    const registerCallArgs = mockedAtobaraiApiClient.registerTransaction.mock.calls[0][0];
    const expectedAmount =
      context.parsedEvent.sourceObjectTotalAmount - context.parsedEvent.refundedAmount;

    expect(registerCallArgs.transactions[0].billed_amount).toBe(expectedAmount);

    const fulfillmentCallArgs = mockedAtobaraiApiClient.reportFulfillment.mock.calls[0][0];

    expect(fulfillmentCallArgs.transactions[0]).toMatchInlineSnapshot(`
        {
          "np_transaction_id": "12345678901",
          "pd_company_code": "50000",
          "slip_no": "1234567890",
        }
      `);
  });

  it("should handle cancel transaction API error", async () => {
    const context: AfterFulfillmentRefundContext = {
      ...baseContext,
      parsedEvent: {
        ...baseContext.parsedEvent,
        grantedRefund: null,
      },
    };

    const apiError = new AtobaraiApiClientCancelTransactionError("Cancel API Error");

    mockedAtobaraiApiClient.cancelTransaction.mockResolvedValue(err(apiError));

    const result = await strategy.execute(context);

    expect(result._unsafeUnwrap()).toBeInstanceOf(
      TransactionRefundRequestedUseCaseResponse.Failure,
    );

    expect(result._unsafeUnwrap().transactionResult.message).toContain(
      "canceling transaction failed",
    );

    expect(mockedAtobaraiApiClient.registerTransaction).not.toHaveBeenCalled();
    expect(mockedAtobaraiApiClient.reportFulfillment).not.toHaveBeenCalled();
  });

  it("should handle register transaction API error", async () => {
    const context: AfterFulfillmentRefundContext = {
      ...baseContext,
      parsedEvent: {
        ...baseContext.parsedEvent,
        grantedRefund: null,
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

    expect(result._unsafeUnwrap().transactionResult.message).toContain(
      "re-registering transaction failed",
    );

    expect(mockedAtobaraiApiClient.reportFulfillment).not.toHaveBeenCalled();
  });

  it("should handle register transaction unsuccessful result", async () => {
    const context: AfterFulfillmentRefundContext = {
      ...baseContext,
      parsedEvent: {
        ...baseContext.parsedEvent,
        grantedRefund: null,
      },
    };

    const mockCancelResponse = createAtobaraiCancelTransactionSuccessResponse({
      results: [{ np_transaction_id: mockedAtobaraiTransactionId }],
    });

    const mockRegisterResponse = createAtobaraiTransactionSuccessResponse({
      results: [
        {
          np_transaction_id: "12345678901",
          authori_result: "20", // Failed
          authori_ng: "RE001", // Required for failed transactions
        },
      ],
    });

    mockedAtobaraiApiClient.cancelTransaction.mockResolvedValue(ok(mockCancelResponse));
    mockedAtobaraiApiClient.registerTransaction.mockResolvedValue(ok(mockRegisterResponse));

    const result = await strategy.execute(context);

    expect(result._unsafeUnwrap()).toBeInstanceOf(
      TransactionRefundRequestedUseCaseResponse.Failure,
    );

    expect(result._unsafeUnwrap().transactionResult.message).toContain(
      "re-registering transaction failed",
    );

    expect(mockedAtobaraiApiClient.reportFulfillment).not.toHaveBeenCalled();
  });

  it("should handle fulfillment report API error", async () => {
    const context: AfterFulfillmentRefundContext = {
      ...baseContext,
      parsedEvent: {
        ...baseContext.parsedEvent,
        grantedRefund: null,
      },
    };

    const mockCancelResponse = createAtobaraiCancelTransactionSuccessResponse({
      results: [{ np_transaction_id: mockedAtobaraiTransactionId }],
    });

    const mockRegisterResponse = createAtobaraiTransactionSuccessResponse({
      results: [
        {
          np_transaction_id: "12345678901",
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

    expect(result._unsafeUnwrap().transactionResult.message).toContain(
      "fulfilling transaction failed",
    );
  });

  it("should calculate adjusted amount correctly for different refund amounts", async () => {
    const context: AfterFulfillmentRefundContext = {
      ...baseContext,
      parsedEvent: {
        ...baseContext.parsedEvent,
        refundedAmount: 50,
        sourceObjectTotalAmount: 150,
        currency: "JPY", // Only JPY is supported
        grantedRefund: null,
      },
    };

    const mockCancelResponse = createAtobaraiCancelTransactionSuccessResponse({
      results: [{ np_transaction_id: mockedAtobaraiTransactionId }],
    });

    const mockRegisterResponse = createAtobaraiTransactionSuccessResponse({
      results: [
        {
          np_transaction_id: "12345678901",
          authori_result: "00",
        },
      ],
    });

    const mockFulfillmentResponse = createAtobaraiFulfillmentReportSuccessResponse({
      results: [{ np_transaction_id: "12345678901" }],
    });

    mockedAtobaraiApiClient.cancelTransaction.mockResolvedValue(ok(mockCancelResponse));
    mockedAtobaraiApiClient.registerTransaction.mockResolvedValue(ok(mockRegisterResponse));
    mockedAtobaraiApiClient.reportFulfillment.mockResolvedValue(ok(mockFulfillmentResponse));

    const result = await strategy.execute(context);

    expect(result._unsafeUnwrap()).toBeInstanceOf(
      TransactionRefundRequestedUseCaseResponse.Success,
    );

    const registerCallArgs = mockedAtobaraiApiClient.registerTransaction.mock.calls[0][0];
    const expectedAmount =
      context.parsedEvent.sourceObjectTotalAmount - context.parsedEvent.refundedAmount;

    expect(registerCallArgs.transactions[0].billed_amount).toBe(expectedAmount);
  });
});
