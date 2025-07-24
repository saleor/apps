import { err, ok } from "neverthrow";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { mockedAppChannelConfig } from "@/__tests__/mocks/app-config/mocked-app-config";
import { mockedAtobaraiApiClient } from "@/__tests__/mocks/atobarai/api/mocked-atobarai-api-client";
import { mockedAtobaraiTransactionId } from "@/__tests__/mocks/atobarai/mocked-atobarai-transaction-id";
import { mockedSourceObject } from "@/__tests__/mocks/saleor-events/mocked-source-object";
import { createAtobaraiCancelTransactionSuccessResponse } from "@/modules/atobarai/api/atobarai-cancel-transaction-success-response";
import { createAtobaraiFulfillmentReportSuccessResponse } from "@/modules/atobarai/api/atobarai-fulfillment-report-success-response";
import { createAtobaraiTransactionSuccessResponse } from "@/modules/atobarai/api/atobarai-transaction-success-response";
import {
  RefundFailureResult,
  RefundSuccessResult,
} from "@/modules/transaction-result/refund-result";

import { ParsedRefundEvent } from "./refund-event-parser";
import { RefundOrchestrator } from "./refund-orchestrator";
import { TransactionRefundRequestedUseCaseResponse } from "./use-case-response";

describe("RefundOrchestrator", () => {
  let orchestrator: RefundOrchestrator;

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
    orchestrator = new RefundOrchestrator();
  });

  describe("processRefund", () => {
    const baseParams = {
      parsedEvent: mockParsedEvent,
      appConfig: mockedAppChannelConfig,
      atobaraiTransactionId: mockedAtobaraiTransactionId,
      apiClient: mockedAtobaraiApiClient,
    };

    describe("when fulfillment has been reported", () => {
      it("should execute fulfillmentFullRefundStrategy for full refund", async () => {
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
                results: [{ np_transaction_id: mockedAtobaraiTransactionId }],
              }),
            ),
          );

        const result = await orchestrator.processRefund({
          ...baseParams,
          parsedEvent: fullRefundEvent,
          hasFulfillmentReported: true,
          saleorTrackingNumber: "TRACK123",
        });

        expect(cancelSpy).toHaveBeenCalledWith({
          transactions: [
            expect.objectContaining({
              np_transaction_id: mockedAtobaraiTransactionId,
            }),
          ],
        });

        expect(result._unsafeUnwrap()).toBeInstanceOf(
          TransactionRefundRequestedUseCaseResponse.Success,
        );
        expect(result._unsafeUnwrap().transactionResult).toBeInstanceOf(RefundSuccessResult);
      });

      it("should execute fulfillmentPartialRefundWithoutLineItemsStrategy for partial refund without line items", async () => {
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
                results: [{ np_transaction_id: mockedAtobaraiTransactionId }],
              }),
            ),
          );

        const registerSpy = vi
          .spyOn(mockedAtobaraiApiClient, "registerTransaction")
          .mockResolvedValueOnce(
            ok(
              createAtobaraiTransactionSuccessResponse({
                results: [{ np_transaction_id: "new_trans_1", authori_result: "00" }],
              }),
            ),
          );

        const fulfillmentSpy = vi
          .spyOn(mockedAtobaraiApiClient, "reportFulfillment")
          .mockResolvedValueOnce(
            ok(
              createAtobaraiFulfillmentReportSuccessResponse({
                results: [{ np_transaction_id: "new_trans_1" }],
              }),
            ),
          );

        const result = await orchestrator.processRefund({
          ...baseParams,
          parsedEvent: partialRefundEvent,
          hasFulfillmentReported: true,
          saleorTrackingNumber: "TRACK123",
        });

        expect(cancelSpy).toHaveBeenCalledTimes(1);
        expect(registerSpy).toHaveBeenCalledWith({
          transactions: [
            expect.objectContaining({
              billed_amount: sourceObjectTotalAmount - refundedAmount,
            }),
          ],
        });
        expect(fulfillmentSpy).toHaveBeenCalledWith({
          transactions: [
            expect.objectContaining({
              np_transaction_id: "new_trans_1",
              slip_no: "TRACK123",
              pd_company_code: mockedAppChannelConfig.shippingCompanyCode,
            }),
          ],
        });

        expect(result._unsafeUnwrap()).toBeInstanceOf(
          TransactionRefundRequestedUseCaseResponse.Success,
        );
        expect(result._unsafeUnwrap().transactionResult).toBeInstanceOf(RefundSuccessResult);
      });

      it("should return failure for partial refund with line items (not supported with fulfillment)", async () => {
        const partialRefundWithLineItemsEvent = {
          ...mockParsedEvent,
          refundedAmount: 1000,
          sourceObjectTotalAmount: 2000,
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

        const result = await orchestrator.processRefund({
          ...baseParams,
          parsedEvent: partialRefundWithLineItemsEvent,
          hasFulfillmentReported: true,
          saleorTrackingNumber: "TRACK123",
        });

        expect(result._unsafeUnwrap()).toBeInstanceOf(
          TransactionRefundRequestedUseCaseResponse.Failure,
        );
        expect(result._unsafeUnwrap().transactionResult).toBeInstanceOf(RefundFailureResult);
      });

      it("should throw error when tracking number is missing", async () => {
        const fullRefundEvent = {
          ...mockParsedEvent,
          refundedAmount: 2000,
          sourceObjectTotalAmount: 2000,
          grantedRefund: null,
        };

        await expect(
          orchestrator.processRefund({
            ...baseParams,
            parsedEvent: fullRefundEvent,
            hasFulfillmentReported: true,
            saleorTrackingNumber: null,
          }),
        ).rejects.toThrow("Tracking number is required for fulfillment.");
      });
    });

    describe("when fulfillment has not been reported", () => {
      it("should execute noFulfillmentPartialRefundWithoutLineItemsStrategy for partial refund without line items if there is no grantedRefund", async () => {
        const refundedAmount = 1000;
        const sourceObjectTotalAmount = 2137;

        const partialRefundEvent = {
          ...mockParsedEvent,
          refundedAmount,
          sourceObjectTotalAmount,
          grantedRefund: null,
        };

        const changeTransactionSpy = vi
          .spyOn(mockedAtobaraiApiClient, "changeTransaction")
          .mockResolvedValueOnce(
            ok({
              results: [
                {
                  np_transaction_id: mockedAtobaraiTransactionId,
                  authori_result: "00",
                },
              ],
            }),
          );

        const result = await orchestrator.processRefund({
          ...baseParams,
          parsedEvent: partialRefundEvent,
          saleorTrackingNumber: null,
          hasFulfillmentReported: false,
        });

        expect(changeTransactionSpy).toHaveBeenCalledWith({
          transactions: [
            expect.objectContaining({
              billed_amount: sourceObjectTotalAmount - refundedAmount,
              goods: expect.arrayContaining([
                expect.objectContaining({
                  goods_price: -(sourceObjectTotalAmount - refundedAmount), // negative amount send to Atobarai
                }),
              ]),
            }),
          ],
        });

        expect(result._unsafeUnwrap()).toBeInstanceOf(
          TransactionRefundRequestedUseCaseResponse.Success,
        );
      });

      it("should return failure when strategy execution fails", async () => {
        const partialRefundEvent = {
          ...mockParsedEvent,
          refundedAmount: 1000,
          sourceObjectTotalAmount: 2000,
          grantedRefund: null,
        };

        const apiError = new Error("API call failed");

        vi.spyOn(mockedAtobaraiApiClient, "changeTransaction").mockResolvedValueOnce(err(apiError));

        const result = await orchestrator.processRefund({
          ...baseParams,
          parsedEvent: partialRefundEvent,
          saleorTrackingNumber: null,
          hasFulfillmentReported: false,
        });

        expect(result._unsafeUnwrap()).toBeInstanceOf(
          TransactionRefundRequestedUseCaseResponse.Failure,
        );
        expect(result._unsafeUnwrap().transactionResult).toBeInstanceOf(RefundFailureResult);
      });

      it("should execute noFulfillmentFullRefundStrategy for full refund", async () => {
        const fullRefundEvent = {
          ...mockParsedEvent,
          refundedAmount: 2000, // Same as total
          sourceObjectTotalAmount: 2000,
          grantedRefund: null,
        };

        const spy = vi.spyOn(mockedAtobaraiApiClient, "cancelTransaction").mockResolvedValueOnce(
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
          saleorTrackingNumber: null,
          hasFulfillmentReported: false,
        });

        expect(spy).toHaveBeenCalledWith({
          transactions: [
            expect.objectContaining({
              np_transaction_id: mockedAtobaraiTransactionId,
            }),
          ],
        });

        expect(result._unsafeUnwrap()).toBeInstanceOf(
          TransactionRefundRequestedUseCaseResponse.Success,
        );
        expect(result._unsafeUnwrap().transactionResult).toBeInstanceOf(RefundSuccessResult);
      });

      it("should execute noFulfillmentPartialRefundWithLineItemsStrategy for partial refund with line items", async () => {
        const refundedAmount = 1_445;
        const sourceObjectTotalAmount = 24_031;
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

        const spy = vi.spyOn(mockedAtobaraiApiClient, "changeTransaction").mockResolvedValueOnce(
          ok({
            results: [
              {
                np_transaction_id: mockedAtobaraiTransactionId,
                authori_result: "00",
              },
            ],
          }),
        );

        const result = await orchestrator.processRefund({
          ...baseParams,
          parsedEvent: partialRefundWithLineItemsEvent,
          saleorTrackingNumber: null,
          hasFulfillmentReported: false,
        });

        expect(spy).toHaveBeenCalledWith({
          transactions: [
            expect.objectContaining({
              billed_amount: sourceObjectTotalAmount - refundedAmount,
              goods: [
                {
                  goods_name: "product-sku",
                  goods_price: mockedSourceObject.lines[0].unitPrice.gross.amount,
                  quantity:
                    mockedSourceObject.lines[0].quantity -
                    partialRefundWithLineItemsEvent.grantedRefund.lines[0].quantity,
                },
                {
                  goods_name: "Voucher",
                  goods_price: mockedSourceObject.discount?.amount,
                  quantity: 1,
                },
                {
                  goods_name: "Shipping",
                  goods_price: mockedSourceObject.shippingPrice.gross.amount,
                  quantity: 1,
                },
              ],
            }),
          ],
        });

        expect(result._unsafeUnwrap()).toBeInstanceOf(
          TransactionRefundRequestedUseCaseResponse.Success,
        );
        expect(result._unsafeUnwrap().transactionResult).toBeInstanceOf(RefundSuccessResult);
      });
    });
  });
});
