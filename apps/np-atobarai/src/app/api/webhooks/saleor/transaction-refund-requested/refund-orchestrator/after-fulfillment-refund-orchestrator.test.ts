import { BaseError } from "@saleor/errors";
import { err, ok } from "neverthrow";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { mockedAppChannelConfig } from "@/__tests__/mocks/app-config/mocked-app-config";
import { getMockedTransactionRecord } from "@/__tests__/mocks/app-transaction/mocked-transaction-record";
import { mockedAtobaraiApiClient } from "@/__tests__/mocks/atobarai/api/mocked-atobarai-api-client";
import { mockedAtobaraiShippingCompanyCode } from "@/__tests__/mocks/atobarai/mocked-atobarai-shipping-company-code";
import { mockedAtobaraiTransactionId } from "@/__tests__/mocks/atobarai/mocked-atobarai-transaction-id";
import { mockedSourceObject } from "@/__tests__/mocks/saleor-events/mocked-source-object";
import { createAtobaraiCancelTransactionSuccessResponse } from "@/modules/atobarai/api/atobarai-cancel-transaction-success-response";
import { createAtobaraiFulfillmentReportSuccessResponse } from "@/modules/atobarai/api/atobarai-fulfillment-report-success-response";
import { createAtobaraiTransactionSuccessResponse } from "@/modules/atobarai/api/atobarai-transaction-success-response";
import {
  RefundFailureResult,
  RefundSuccessResult,
} from "@/modules/transaction-result/refund-result";

import { ParsedRefundEvent } from "../refund-event-parser";
import { TransactionRefundRequestedUseCaseResponse } from "../use-case-response";
import { AfterFulfillmentRefundOrchestrator } from "./after-fulfillment-refund-orchestrator";

describe("AfterFulfillmentRefundOrchestrator", () => {
  let orchestrator: AfterFulfillmentRefundOrchestrator;

  const mockParsedEvent = {
    refundedAmount: 1000,
    sourceObjectTotalAmount: 2000,
    channelId: "channel-1",
    pspReference: mockedAtobaraiTransactionId,
    transactionToken: "saleor-transaction-token",
    issuedAt: "2023-01-01T00:00:00Z",
    sourceObject: mockedSourceObject,
    grantedRefund: null,
    currency: "JPY",
  } satisfies ParsedRefundEvent;

  beforeEach(() => {
    orchestrator = new AfterFulfillmentRefundOrchestrator();
    vi.clearAllMocks();
  });

  describe("processRefund", () => {
    const baseParams = {
      parsedEvent: mockParsedEvent,
      appConfig: mockedAppChannelConfig,
      atobaraiTransactionId: mockedAtobaraiTransactionId,
      apiClient: mockedAtobaraiApiClient,
    };

    const transactionRecordAfterFulfillment = getMockedTransactionRecord({
      saleorTrackingNumber: "TRACK123456",
      fulfillmentMetadataShippingCompanyCode: mockedAtobaraiShippingCompanyCode,
    });

    describe("when fulfillment has been reported", () => {
      it("should throw error when tracking number is missing", async () => {
        const transactionRecordWithoutTracking = getMockedTransactionRecord({
          saleorTrackingNumber: null,
          fulfillmentMetadataShippingCompanyCode: mockedAtobaraiShippingCompanyCode,
        });

        await expect(
          orchestrator.processRefund({
            ...baseParams,
            transactionRecord: transactionRecordWithoutTracking,
          }),
        ).rejects.toThrow(BaseError);
      });

      it("should execute afterFulfillmentFullRefundStrategy for full refund", async () => {
        const fullRefundEvent = {
          ...mockParsedEvent,
          refundedAmount: 2000, // Same as total
          sourceObjectTotalAmount: 2000,
          grantedRefund: null,
        };

        const cancelSpy = vi
          .spyOn(mockedAtobaraiApiClient, "cancelTransaction")
          .mockResolvedValueOnce(
            ok(
              createAtobaraiCancelTransactionSuccessResponse({
                results: [
                  {
                    np_transaction_id: mockedAtobaraiTransactionId,
                  },
                ],
              }),
            ),
          );

        const result = await orchestrator.processRefund({
          ...baseParams,
          parsedEvent: fullRefundEvent,
          transactionRecord: transactionRecordAfterFulfillment,
        });

        expect(cancelSpy).toHaveBeenCalledWith(
          {
            transactions: [
              expect.objectContaining({
                np_transaction_id: mockedAtobaraiTransactionId,
              }),
            ],
          },
          {
            rejectMultipleResults: true,
          },
        );

        expect(result._unsafeUnwrap()).toBeInstanceOf(
          TransactionRefundRequestedUseCaseResponse.Success,
        );
        expect(result._unsafeUnwrap().transactionResult).toBeInstanceOf(RefundSuccessResult);
      });

      it("should execute afterFulfillmentPartialRefundWithLineItemsStrategy for partial refund with line items", async () => {
        const refundedAmount = 1000;
        const sourceObjectTotalAmount = 2000;
        const partialRefundWithLineItemsEvent = {
          ...mockParsedEvent,
          refundedAmount,
          sourceObjectTotalAmount,
          grantedRefund: {
            lines: [
              {
                orderLine: {
                  id: mockedSourceObject.lines[0].id,
                },
                quantity: 1,
              },
            ],
            shippingCostsIncluded: false,
          },
        };

        const cancelSpy = vi
          .spyOn(mockedAtobaraiApiClient, "cancelTransaction")
          .mockResolvedValueOnce(
            ok(
              createAtobaraiCancelTransactionSuccessResponse({
                results: [
                  {
                    np_transaction_id: mockedAtobaraiTransactionId,
                  },
                ],
              }),
            ),
          );

        const registerSpy = vi
          .spyOn(mockedAtobaraiApiClient, "registerTransaction")
          .mockResolvedValueOnce(
            ok(
              createAtobaraiTransactionSuccessResponse({
                results: [
                  {
                    np_transaction_id: mockedAtobaraiTransactionId,
                    authori_result: "00",
                  },
                ],
              }),
            ),
          );

        const fulfillmentSpy = vi
          .spyOn(mockedAtobaraiApiClient, "reportFulfillment")
          .mockResolvedValueOnce(
            ok(
              createAtobaraiFulfillmentReportSuccessResponse({
                results: [
                  {
                    np_transaction_id: mockedAtobaraiTransactionId,
                  },
                ],
              }),
            ),
          );

        const result = await orchestrator.processRefund({
          ...baseParams,
          parsedEvent: partialRefundWithLineItemsEvent,
          transactionRecord: transactionRecordAfterFulfillment,
        });

        expect(cancelSpy).toHaveBeenCalledTimes(1);
        expect(registerSpy).toHaveBeenCalledTimes(1);
        expect(fulfillmentSpy).toHaveBeenCalledTimes(1);

        // Verify register transaction payload
        const registerCallArgs = registerSpy.mock.calls[0][0];

        expect(registerCallArgs.transactions[0].billed_amount).toBe(
          sourceObjectTotalAmount - refundedAmount,
        );

        // Verify fulfillment payload
        const fulfillmentCallArgs = fulfillmentSpy.mock.calls[0][0];

        expect(fulfillmentCallArgs.transactions).toStrictEqual(
          expect.arrayContaining([
            expect.objectContaining({
              np_transaction_id: mockedAtobaraiTransactionId,
            }),
          ]),
        );

        expect(result._unsafeUnwrap()).toBeInstanceOf(
          TransactionRefundRequestedUseCaseResponse.Success,
        );
        expect(result._unsafeUnwrap().transactionResult).toBeInstanceOf(RefundSuccessResult);
      });

      it("should execute afterFulfillmentPartialRefundWithoutLineItemsStrategy for partial refund without line items", async () => {
        const refundedAmount = 1000;
        const sourceObjectTotalAmount = 2000;
        const partialRefundEvent = {
          ...mockParsedEvent,
          refundedAmount,
          sourceObjectTotalAmount,
          grantedRefund: null,
        };

        const cancelSpy = vi
          .spyOn(mockedAtobaraiApiClient, "cancelTransaction")
          .mockResolvedValueOnce(
            ok(
              createAtobaraiCancelTransactionSuccessResponse({
                results: [
                  {
                    np_transaction_id: mockedAtobaraiTransactionId,
                  },
                ],
              }),
            ),
          );

        const registerSpy = vi
          .spyOn(mockedAtobaraiApiClient, "registerTransaction")
          .mockResolvedValueOnce(
            ok(
              createAtobaraiTransactionSuccessResponse({
                results: [
                  {
                    np_transaction_id: mockedAtobaraiTransactionId,
                    authori_result: "00",
                  },
                ],
              }),
            ),
          );

        const fulfillmentSpy = vi
          .spyOn(mockedAtobaraiApiClient, "reportFulfillment")
          .mockResolvedValueOnce(
            ok(
              createAtobaraiFulfillmentReportSuccessResponse({
                results: [
                  {
                    np_transaction_id: mockedAtobaraiTransactionId,
                  },
                ],
              }),
            ),
          );

        const result = await orchestrator.processRefund({
          ...baseParams,
          parsedEvent: partialRefundEvent,
          transactionRecord: transactionRecordAfterFulfillment,
        });

        expect(cancelSpy).toHaveBeenCalledTimes(1);
        expect(registerSpy).toHaveBeenCalledTimes(1);
        expect(fulfillmentSpy).toHaveBeenCalledTimes(1);

        // Verify register transaction payload
        const registerCallArgs = registerSpy.mock.calls[0][0];

        expect(registerCallArgs.transactions[0].billed_amount).toBe(
          sourceObjectTotalAmount - refundedAmount,
        );

        expect(registerCallArgs.transactions[0].goods).toStrictEqual(
          expect.arrayContaining([
            expect.objectContaining({
              goods_price: -refundedAmount,
            }),
          ]),
        );

        expect(result._unsafeUnwrap()).toBeInstanceOf(
          TransactionRefundRequestedUseCaseResponse.Success,
        );
        expect(result._unsafeUnwrap().transactionResult).toBeInstanceOf(RefundSuccessResult);
      });

      it("should return failure when strategy execution fails", async () => {
        const fullRefundEvent = {
          ...mockParsedEvent,
          refundedAmount: 2000,
          sourceObjectTotalAmount: 2000,
          grantedRefund: null,
        };

        const apiError = new Error("API call failed");

        vi.spyOn(mockedAtobaraiApiClient, "cancelTransaction").mockResolvedValueOnce(err(apiError));

        const result = await orchestrator.processRefund({
          ...baseParams,
          parsedEvent: fullRefundEvent,
          transactionRecord: transactionRecordAfterFulfillment,
        });

        expect(result._unsafeUnwrap()).toBeInstanceOf(
          TransactionRefundRequestedUseCaseResponse.Failure,
        );
        expect(result._unsafeUnwrap().transactionResult).toBeInstanceOf(RefundFailureResult);
      });

      it("should use app config shipping company code when transaction record doesn't have one", async () => {
        const transactionRecordWithoutShippingCode = getMockedTransactionRecord({
          saleorTrackingNumber: "TRACK123456",
          fulfillmentMetadataShippingCompanyCode: null,
        });

        const partialRefundEvent = {
          ...mockParsedEvent,
          refundedAmount: 1000,
          sourceObjectTotalAmount: 2000,
          grantedRefund: null,
        };

        vi.spyOn(mockedAtobaraiApiClient, "cancelTransaction").mockResolvedValueOnce(
          ok(
            createAtobaraiCancelTransactionSuccessResponse({
              results: [{ np_transaction_id: mockedAtobaraiTransactionId }],
            }),
          ),
        );

        vi.spyOn(mockedAtobaraiApiClient, "registerTransaction").mockResolvedValueOnce(
          ok(
            createAtobaraiTransactionSuccessResponse({
              results: [
                {
                  np_transaction_id: mockedAtobaraiTransactionId,
                  authori_result: "00",
                },
              ],
            }),
          ),
        );

        const fulfillmentSpy = vi
          .spyOn(mockedAtobaraiApiClient, "reportFulfillment")
          .mockResolvedValueOnce(
            ok(
              createAtobaraiFulfillmentReportSuccessResponse({
                results: [{ np_transaction_id: mockedAtobaraiTransactionId }],
              }),
            ),
          );

        await orchestrator.processRefund({
          ...baseParams,
          appConfig: mockedAppChannelConfig,
          parsedEvent: partialRefundEvent,
          transactionRecord: transactionRecordWithoutShippingCode,
        });

        // Verify that app config shipping company code is used
        const fulfillmentCallArgs = fulfillmentSpy.mock.calls[0][0];

        expect(fulfillmentCallArgs.transactions).toStrictEqual(
          expect.arrayContaining([
            expect.objectContaining({
              pd_company_code: mockedAppChannelConfig.shippingCompanyCode,
            }),
          ]),
        );
      });
    });
  });
});
