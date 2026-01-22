import { err, ok } from "neverthrow";
import { describe, expect, it, vi } from "vitest";

import { mockedAppChannelConfig } from "@/__tests__/mocks/app-config/mocked-app-config";
import { mockedAppConfigRepo } from "@/__tests__/mocks/app-config/mocked-app-config-repo";
import { MockedTransactionRecordRepo } from "@/__tests__/mocks/app-transaction/mocked-transaction-record-repo";
import { mockedAtobaraiApiClient } from "@/__tests__/mocks/atobarai/api/mocked-atobarai-api-client";
import { mockedAtobaraiShippingCompanyCode } from "@/__tests__/mocks/atobarai/mocked-atobarai-shipping-company-code";
import { mockedAtobaraiTransactionId } from "@/__tests__/mocks/atobarai/mocked-atobarai-transaction-id";
import { mockedSaleorApiUrl } from "@/__tests__/mocks/saleor/mocked-saleor-api-url";
import { mockedSaleorAppId } from "@/__tests__/mocks/saleor/mocked-saleor-app-id";
import { mockedRefundRequestedEvent } from "@/__tests__/mocks/saleor-events/mocked-refund-requested-event";
import { TransactionRefundRequestedEventFragment } from "@/generated/graphql";
import { createAtobaraiCancelTransactionSuccessResponse } from "@/modules/atobarai/api/atobarai-cancel-transaction-success-response";
import { createAtobaraiFulfillmentReportSuccessResponse } from "@/modules/atobarai/api/atobarai-fulfillment-report-success-response";
import { createAtobaraiTransactionSuccessResponse } from "@/modules/atobarai/api/atobarai-transaction-success-response";
import {
  AtobaraiApiClientCancelTransactionError,
  AtobaraiApiClientFulfillmentReportError,
  AtobaraiApiClientRegisterTransactionError,
  IAtobaraiApiClientFactory,
} from "@/modules/atobarai/api/types";
import {
  RefundFailureResult,
  RefundSuccessResult,
} from "@/modules/transaction-result/refund-result";
import { TransactionRecord } from "@/modules/transactions-recording/transaction-record";

import { TransactionRefundRequestedUseCase } from "./use-case";
import { TransactionRefundRequestedUseCaseResponse } from "./use-case-response";

describe("TransactionRefundRequestedUseCase", () => {
  const atobaraiApiClientFactory = {
    create: () => mockedAtobaraiApiClient,
  } satisfies IAtobaraiApiClientFactory;

  it("should return REFUND_FAILURE when action amount is missing", async () => {
    const event = {
      ...mockedRefundRequestedEvent,
      action: { amount: null, currency: "JPY" },
    };

    const useCase = new TransactionRefundRequestedUseCase({
      appConfigRepo: mockedAppConfigRepo,
      atobaraiApiClientFactory,
      transactionRecordRepo: new MockedTransactionRecordRepo(),
    });

    const result = await useCase.execute({
      appId: mockedSaleorAppId,
      // @ts-expect-error - testing invalid input
      event,
      saleorApiUrl: mockedSaleorApiUrl,
    });

    expect(await result._unsafeUnwrap().getResponse().json()).toMatchInlineSnapshot(`
      {
        "actions": [
          "REFUND",
        ],
        "message": "Failed to process NP Atobarai transaction refund: missing required data for refund",
        "result": "REFUND_FAILURE",
      }
    `);
  });

  it("should return REFUND_FAILURE when transaction is missing", async () => {
    const event = {
      ...mockedRefundRequestedEvent,
      transaction: null,
    };

    const useCase = new TransactionRefundRequestedUseCase({
      appConfigRepo: mockedAppConfigRepo,
      atobaraiApiClientFactory,
      transactionRecordRepo: new MockedTransactionRecordRepo(),
    });

    const result = await useCase.execute({
      appId: mockedSaleorAppId,
      event,
      saleorApiUrl: mockedSaleorApiUrl,
    });

    expect(await result._unsafeUnwrap().getResponse().json()).toMatchInlineSnapshot(
      `
      {
        "actions": [
          "REFUND",
        ],
        "message": "Failed to process NP Atobarai transaction refund: missing required data for refund",
        "result": "REFUND_FAILURE",
      }
    `,
    );
  });

  it("should return REFUND_FAILURE when transaction total amount is missing from both checkout and order", async () => {
    const event: TransactionRefundRequestedEventFragment = {
      ...mockedRefundRequestedEvent,
      transaction: {
        ...mockedRefundRequestedEvent.transaction,
        pspReference: mockedAtobaraiTransactionId,
        token: "saleor-transaction-token",
        // @ts-expect-error - for testing
        chargedAmount: null,
      },
    };

    const useCase = new TransactionRefundRequestedUseCase({
      appConfigRepo: mockedAppConfigRepo,
      atobaraiApiClientFactory,
      transactionRecordRepo: new MockedTransactionRecordRepo(),
    });

    const result = await useCase.execute({
      appId: mockedSaleorAppId,
      event,
      saleorApiUrl: mockedSaleorApiUrl,
    });

    expect(await result._unsafeUnwrap().getResponse().json()).toMatchInlineSnapshot(
      `
      {
        "actions": [
          "REFUND",
        ],
        "message": "Failed to process NP Atobarai transaction refund: missing required data for refund",
        "result": "REFUND_FAILURE",
      }
    `,
    );
  });

  describe("before fulfillment refunds", () => {
    describe("full refund before fulfillment", () => {
      it("should successfully cancel transaction in NP Atobarai when full amount refund is requested and order is not yet fulfilled and return RefundSuccessResult", async () => {
        const event = {
          ...mockedRefundRequestedEvent,
        };

        const transactionRecordRepo = new MockedTransactionRecordRepo();

        transactionRecordRepo.createTransaction(
          {
            saleorApiUrl: mockedSaleorApiUrl,
            appId: mockedSaleorAppId,
          },
          new TransactionRecord({
            atobaraiTransactionId: mockedAtobaraiTransactionId,
            saleorTrackingNumber: null,
            fulfillmentMetadataShippingCompanyCode: null,
          }),
        );

        const mockCancelResponse = createAtobaraiCancelTransactionSuccessResponse({
          results: [
            {
              np_transaction_id: mockedAtobaraiTransactionId,
            },
          ],
        });

        const spy = vi
          .spyOn(mockedAtobaraiApiClient, "cancelTransaction")
          .mockResolvedValue(ok(mockCancelResponse));

        vi.spyOn(mockedAppConfigRepo, "getChannelConfig").mockImplementationOnce(() =>
          ok(mockedAppChannelConfig),
        );

        const useCase = new TransactionRefundRequestedUseCase({
          appConfigRepo: mockedAppConfigRepo,
          atobaraiApiClientFactory,
          transactionRecordRepo,
        });

        const result = await useCase.execute({
          appId: mockedSaleorAppId,
          event,
          saleorApiUrl: mockedSaleorApiUrl,
        });

        expect(result._unsafeUnwrap()).toBeInstanceOf(
          TransactionRefundRequestedUseCaseResponse.Success,
        );

        expect(result._unsafeUnwrap().transactionResult).toBeInstanceOf(RefundSuccessResult);

        expect(spy).toHaveBeenCalledWith(
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

      it("should return RefundFailureResult when cancel transaction fails", async () => {
        const event = {
          ...mockedRefundRequestedEvent,
        };

        const cancelError = new AtobaraiApiClientCancelTransactionError("Cancel failed");

        const spy = vi
          .spyOn(mockedAtobaraiApiClient, "cancelTransaction")
          .mockResolvedValue(err(cancelError));

        vi.spyOn(mockedAppConfigRepo, "getChannelConfig").mockImplementationOnce(() =>
          ok(mockedAppChannelConfig),
        );

        const transactionRecordRepo = new MockedTransactionRecordRepo();

        transactionRecordRepo.createTransaction(
          {
            saleorApiUrl: mockedSaleorApiUrl,
            appId: mockedSaleorAppId,
          },
          new TransactionRecord({
            atobaraiTransactionId: mockedAtobaraiTransactionId,
            saleorTrackingNumber: null,
            fulfillmentMetadataShippingCompanyCode: null,
          }),
        );

        const useCase = new TransactionRefundRequestedUseCase({
          appConfigRepo: mockedAppConfigRepo,
          atobaraiApiClientFactory,
          transactionRecordRepo,
        });

        const result = await useCase.execute({
          appId: mockedSaleorAppId,
          event,
          saleorApiUrl: mockedSaleorApiUrl,
        });

        expect(result._unsafeUnwrap()).toBeInstanceOf(
          TransactionRefundRequestedUseCaseResponse.Failure,
        );
        expect(result._unsafeUnwrap().transactionResult).toBeInstanceOf(RefundFailureResult);
        expect(spy).toHaveBeenCalledWith(
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
    });

    describe("partial refunds before fulfillment", () => {
      describe("partial refund without line items", () => {
        it("should successfully process partial refund without line items when fulfillment not reported", async () => {
          const partialRefundEvent = {
            ...mockedRefundRequestedEvent,
            action: { amount: 1500, currency: "JPY" }, // Partial amount (less than total)
            transaction: {
              ...mockedRefundRequestedEvent.transaction,
              order: {
                ...mockedRefundRequestedEvent.transaction.order,
                __typename: "Order" as const,
                total: {
                  gross: {
                    amount: 3000, // Total order amount
                  },
                },
                lines: [
                  {
                    id: "line-1",
                    __typename: "OrderLine" as const,
                    quantity: 2,
                    unitPrice: {
                      gross: {
                        amount: 1000,
                      },
                    },
                    orderVariant: {
                      product: {
                        name: "Test Product",
                      },
                      sku: "TEST-SKU",
                    },
                  },
                ],
                discount: {
                  amount: 100,
                },
                shippingPrice: {
                  gross: {
                    amount: 200,
                  },
                },
                channel: {
                  id: mockedRefundRequestedEvent.transaction.order.channel.id,
                  slug: "default-channel",
                  currencyCode: "JPY",
                },
                billingAddress: {
                  firstName: "John",
                  lastName: "Doe",
                  phone: "+81123456789",
                  country: {
                    code: "JP",
                  },
                  postalCode: "1000001",
                  countryArea: "Tokyo",
                  streetAddress1: "1-1-1 Shibuya",
                  streetAddress2: "Apt 101",
                  companyName: "Test Company",
                  city: "Tokyo",
                  cityArea: "Shibuya",
                },
                shippingAddress: {
                  firstName: "John",
                  lastName: "Doe",
                  phone: "+81123456789",
                  country: {
                    code: "JP",
                  },
                  postalCode: "1000001",
                  countryArea: "Tokyo",
                  streetAddress1: "1-1-1 Shibuya",
                  streetAddress2: "Apt 101",
                  companyName: "Test Company",
                  city: "Tokyo",
                  cityArea: "Shibuya",
                },
                userEmail: "test@example.com",
              },
            },
            grantedRefund: null, // No line items specified
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

          vi.spyOn(mockedAppConfigRepo, "getChannelConfig").mockImplementationOnce(() =>
            ok(mockedAppChannelConfig),
          );

          const transactionRecordRepo = new MockedTransactionRecordRepo();

          transactionRecordRepo.createTransaction(
            {
              saleorApiUrl: mockedSaleorApiUrl,
              appId: mockedSaleorAppId,
            },
            new TransactionRecord({
              atobaraiTransactionId: mockedAtobaraiTransactionId,
              saleorTrackingNumber: null,
              fulfillmentMetadataShippingCompanyCode: null,
            }),
          );

          const useCase = new TransactionRefundRequestedUseCase({
            appConfigRepo: mockedAppConfigRepo,
            atobaraiApiClientFactory,
            transactionRecordRepo,
          });

          const result = await useCase.execute({
            appId: mockedSaleorAppId,
            event: partialRefundEvent,
            saleorApiUrl: mockedSaleorApiUrl,
          });

          expect(result._unsafeUnwrap()).toBeInstanceOf(
            TransactionRefundRequestedUseCaseResponse.Success,
          );
          expect(result._unsafeUnwrap().transactionResult).toBeInstanceOf(RefundSuccessResult);
          expect(spy).toHaveBeenCalledWith(
            {
              transactions: [
                {
                  np_transaction_id: mockedAtobaraiTransactionId,
                  shop_transaction_id: "saleor-transaction-token",
                  shop_order_date: "2023-01-01",
                  settlement_type: "02",
                  billed_amount: 1500,
                  customer: expect.any(Object),
                  dest_customer: expect.any(Object),
                  goods: [
                    {
                      goods_name: "TEST-SKU", // Uses SKU because skuAsName is true
                      goods_price: 1000,
                      quantity: 2,
                    },
                    {
                      goods_name: "Voucher",
                      goods_price: -100,
                      quantity: 1,
                    },
                    {
                      goods_name: "Shipping",
                      goods_price: 200,
                      quantity: 1,
                    },
                    {
                      goods_name: "Discount",
                      goods_price: -1500, // Discount amount equals refund amount
                      quantity: 1,
                    },
                  ],
                },
              ],
            },
            { rejectMultipleResults: true },
          );
        });
      });

      describe("partial refund with line items", () => {
        it("should successfully process partial refund with line items when fulfillment not reported", async () => {
          const partialRefundWithLineItemsEvent = {
            ...mockedRefundRequestedEvent,
            action: { amount: 1000, currency: "JPY" }, // Partial amount
            transaction: {
              ...mockedRefundRequestedEvent.transaction,
              order: {
                ...mockedRefundRequestedEvent.transaction.order,
                __typename: "Order" as const,
                total: {
                  gross: {
                    amount: 3500,
                  },
                },
                lines: [
                  {
                    id: "line-1",
                    __typename: "OrderLine" as const,
                    quantity: 3,
                    unitPrice: {
                      gross: {
                        amount: 1000,
                      },
                    },
                    orderVariant: {
                      product: {
                        name: "Product 1",
                      },
                      sku: "SKU-1",
                    },
                  },
                  {
                    id: "line-2",
                    __typename: "OrderLine" as const,
                    quantity: 2,
                    unitPrice: {
                      gross: {
                        amount: 500,
                      },
                    },
                    orderVariant: {
                      product: {
                        name: "Product 2",
                      },
                      sku: "SKU-2",
                    },
                  },
                ],
                discount: {
                  amount: 100,
                },
                shippingPrice: {
                  gross: {
                    amount: 200,
                  },
                },
                channel: {
                  id: mockedRefundRequestedEvent.transaction.order.channel.id,
                  slug: "default-channel",
                  currencyCode: "JPY",
                },
                billingAddress: {
                  firstName: "John",
                  lastName: "Doe",
                  phone: "+81123456789",
                  country: {
                    code: "JP",
                  },
                  postalCode: "1000001",
                  countryArea: "Tokyo",
                  streetAddress1: "1-1-1 Shibuya",
                  streetAddress2: "Apt 101",
                  companyName: "Test Company",
                  city: "Tokyo",
                  cityArea: "Shibuya",
                },
                shippingAddress: {
                  firstName: "John",
                  lastName: "Doe",
                  phone: "+81123456789",
                  country: {
                    code: "JP",
                  },
                  postalCode: "1000001",
                  countryArea: "Tokyo",
                  streetAddress1: "1-1-1 Shibuya",
                  streetAddress2: "Apt 101",
                  companyName: "Test Company",
                  city: "Tokyo",
                  cityArea: "Shibuya",
                },
                userEmail: "test@example.com",
              },
            },
            grantedRefund: {
              lines: [
                {
                  orderLine: {
                    id: "line-1",
                  },
                  quantity: 1, // Refund 1 out of 3
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

          vi.spyOn(mockedAppConfigRepo, "getChannelConfig").mockImplementationOnce(() =>
            ok(mockedAppChannelConfig),
          );

          const transactionRecordRepo = new MockedTransactionRecordRepo();

          transactionRecordRepo.createTransaction(
            {
              saleorApiUrl: mockedSaleorApiUrl,
              appId: mockedSaleorAppId,
            },
            new TransactionRecord({
              atobaraiTransactionId: mockedAtobaraiTransactionId,
              saleorTrackingNumber: null,
              fulfillmentMetadataShippingCompanyCode: null,
            }),
          );

          const useCase = new TransactionRefundRequestedUseCase({
            appConfigRepo: mockedAppConfigRepo,
            atobaraiApiClientFactory,
            transactionRecordRepo,
          });

          const result = await useCase.execute({
            appId: mockedSaleorAppId,
            event: partialRefundWithLineItemsEvent,
            saleorApiUrl: mockedSaleorApiUrl,
          });

          expect(result._unsafeUnwrap()).toBeInstanceOf(
            TransactionRefundRequestedUseCaseResponse.Success,
          );
          expect(result._unsafeUnwrap().transactionResult).toBeInstanceOf(RefundSuccessResult);
          expect(spy).toHaveBeenCalledWith(
            {
              transactions: [
                {
                  goods: [
                    {
                      goods_name: "SKU-1",
                      goods_price: 1000,
                      quantity: 2, // 3 - 1 = 2 remaining
                    },
                    {
                      goods_name: "SKU-2",
                      goods_price: 500,
                      quantity: 2, // Not refunded, remains 2
                    },
                    {
                      goods_name: "Voucher",
                      goods_price: -100,
                      quantity: 1,
                    },
                    {
                      goods_name: "Shipping",
                      goods_price: 200,
                      quantity: 1,
                    },
                  ],
                  np_transaction_id: mockedAtobaraiTransactionId,
                  settlement_type: "02",
                  shop_order_date: "2023-01-01",
                  shop_transaction_id: "saleor-transaction-token",
                  billed_amount: 2500,
                  customer: {
                    address: "Tokyo千代田区千代田1-1-1 ShibuyaApt 101",
                    company_name: "Test Company",
                    customer_name: "Doe John",
                    email: "test@example.com",
                    tel: "0123456789",
                    zip_code: "1000001",
                  },
                  dest_customer: {
                    address: "Tokyo千代田区千代田1-1-1 ShibuyaApt 101",
                    company_name: "Test Company",
                    customer_name: "Doe John",
                    tel: "0123456789",
                    zip_code: "1000001",
                  },
                },
              ],
            },
            { rejectMultipleResults: true },
          );
        });

        it("should successfully process partial refund with line items including shipping costs", async () => {
          const partialRefundWithShippingEvent = {
            ...mockedRefundRequestedEvent,
            action: { amount: 1200, currency: "JPY" },
            transaction: {
              ...mockedRefundRequestedEvent.transaction,
              order: {
                ...mockedRefundRequestedEvent.transaction.order,
                __typename: "Order" as const,
                total: {
                  gross: {
                    amount: 2500,
                  },
                },
                lines: [
                  {
                    id: "line-1",
                    __typename: "OrderLine" as const,
                    quantity: 2,
                    unitPrice: {
                      gross: {
                        amount: 1000,
                      },
                    },
                    orderVariant: {
                      product: {
                        name: "Product 1",
                      },
                      sku: "SKU-1",
                    },
                  },
                ],
                discount: {
                  amount: 50,
                },
                shippingPrice: {
                  gross: {
                    amount: 300,
                  },
                },
                channel: {
                  id: mockedRefundRequestedEvent.transaction.order.channel.id,
                  slug: "default-channel",
                  currencyCode: "JPY",
                },
                billingAddress: {
                  firstName: "John",
                  lastName: "Doe",
                  phone: "+81123456789",
                  country: {
                    code: "JP",
                  },
                  postalCode: "1000001",
                  countryArea: "Tokyo",
                  streetAddress1: "1-1-1 Shibuya",
                  streetAddress2: "Apt 101",
                  companyName: "Test Company",
                  city: "Tokyo",
                  cityArea: "Shibuya",
                },
                shippingAddress: {
                  firstName: "John",
                  lastName: "Doe",
                  phone: "+81123456789",
                  country: {
                    code: "JP",
                  },
                  postalCode: "1000001",
                  countryArea: "Tokyo",
                  streetAddress1: "1-1-1 Shibuya",
                  streetAddress2: "Apt 101",
                  city: "Tokyo",
                  companyName: "Test Company",
                  cityArea: "Shibuya",
                },
                userEmail: "test@example.com",
              },
            },
            grantedRefund: {
              lines: [
                {
                  orderLine: {
                    id: "line-1",
                  },
                  quantity: 1,
                },
              ],
              shippingCostsIncluded: true, // Include shipping in refund
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

          vi.spyOn(mockedAppConfigRepo, "getChannelConfig").mockImplementationOnce(() =>
            ok(mockedAppChannelConfig),
          );

          const transactionRecordRepo = new MockedTransactionRecordRepo();

          transactionRecordRepo.createTransaction(
            {
              saleorApiUrl: mockedSaleorApiUrl,
              appId: mockedSaleorAppId,
            },
            new TransactionRecord({
              atobaraiTransactionId: mockedAtobaraiTransactionId,
              saleorTrackingNumber: null,
              fulfillmentMetadataShippingCompanyCode: null,
            }),
          );

          const useCase = new TransactionRefundRequestedUseCase({
            appConfigRepo: mockedAppConfigRepo,
            atobaraiApiClientFactory,
            transactionRecordRepo,
          });

          const result = await useCase.execute({
            appId: mockedSaleorAppId,
            event: partialRefundWithShippingEvent,
            saleorApiUrl: mockedSaleorApiUrl,
          });

          expect(result._unsafeUnwrap()).toBeInstanceOf(
            TransactionRefundRequestedUseCaseResponse.Success,
          );
          expect(result._unsafeUnwrap().transactionResult).toBeInstanceOf(RefundSuccessResult);
          expect(spy).toHaveBeenCalledWith(
            {
              transactions: [
                {
                  dest_customer: {
                    address: "Tokyo千代田区千代田1-1-1 ShibuyaApt 101",
                    company_name: "Test Company",
                    customer_name: "Doe John",
                    tel: "0123456789",
                    zip_code: "1000001",
                  },
                  billed_amount: 1300,
                  settlement_type: "02",
                  shop_order_date: "2023-01-01",
                  shop_transaction_id: "saleor-transaction-token",
                  np_transaction_id: mockedAtobaraiTransactionId,
                  customer: {
                    address: "Tokyo千代田区千代田1-1-1 ShibuyaApt 101",
                    company_name: "Test Company",
                    customer_name: "Doe John",
                    email: "test@example.com",
                    tel: "0123456789",
                    zip_code: "1000001",
                  },
                  goods: [
                    {
                      goods_name: "SKU-1", // Uses SKU because skuAsName is true
                      goods_price: 1000,
                      quantity: 1, // 2 - 1 = 1 remaining
                    },
                    {
                      goods_name: "Voucher",
                      goods_price: -50,
                      quantity: 1,
                    },
                    {
                      goods_name: "Shipping",
                      goods_price: 300,
                      quantity: 1,
                    },
                    {
                      goods_name: "Discount",
                      goods_price: -300, // Shipping amount as discount
                      quantity: 1,
                    },
                  ],
                },
              ],
            },
            {
              rejectMultipleResults: true,
            },
          );
        });
      });

      describe("partial refund error scenarios", () => {
        it("should handle API error during partial refund", async () => {
          const partialRefundEvent = {
            ...mockedRefundRequestedEvent,
            action: { amount: 1000, currency: "JPY" },
            transaction: {
              ...mockedRefundRequestedEvent.transaction,
              order: {
                ...mockedRefundRequestedEvent.transaction.order,
                __typename: "Order" as const,
                total: {
                  gross: {
                    amount: 2000,
                  },
                },
                lines: [
                  {
                    id: "line-1",
                    __typename: "OrderLine" as const,
                    quantity: 1,
                    unitPrice: {
                      gross: {
                        amount: 1500,
                      },
                    },
                    orderVariant: {
                      product: {
                        name: "Test Product",
                      },
                      sku: "TEST-SKU",
                    },
                  },
                ],
                discount: null,
                shippingPrice: {
                  gross: {
                    amount: 100,
                  },
                },
                channel: {
                  id: mockedRefundRequestedEvent.transaction.order.channel.id,
                  slug: "default-channel",
                  currencyCode: "JPY",
                },
                billingAddress: {
                  firstName: "John",
                  lastName: "Doe",
                  phone: "+81123456789",
                  country: {
                    code: "JP",
                  },
                  postalCode: "1000001",
                  countryArea: "Tokyo",
                  streetAddress1: "1-1-1 Shibuya",
                  streetAddress2: "Apt 101",
                  companyName: "Test Company",
                  city: "Tokyo",
                  cityArea: "Shibuya",
                },
                shippingAddress: {
                  firstName: "John",
                  lastName: "Doe",
                  phone: "+81123456789",
                  country: {
                    code: "JP",
                  },
                  postalCode: "1000001",
                  countryArea: "Tokyo",
                  streetAddress1: "1-1-1 Shibuya",
                  streetAddress2: "Apt 101",
                  companyName: "Test Company",
                  city: "Tokyo",
                  cityArea: "Shibuya",
                },
                userEmail: "test@example.com",
              },
            },
            grantedRefund: null,
          };

          const spy = vi
            .spyOn(mockedAtobaraiApiClient, "changeTransaction")
            .mockResolvedValueOnce(err(new AtobaraiApiClientCancelTransactionError("API Error")));

          vi.spyOn(mockedAppConfigRepo, "getChannelConfig").mockImplementationOnce(() =>
            ok(mockedAppChannelConfig),
          );

          const transactionRecordRepo = new MockedTransactionRecordRepo();

          transactionRecordRepo.createTransaction(
            {
              saleorApiUrl: mockedSaleorApiUrl,
              appId: mockedSaleorAppId,
            },
            new TransactionRecord({
              atobaraiTransactionId: mockedAtobaraiTransactionId,
              saleorTrackingNumber: null,
              fulfillmentMetadataShippingCompanyCode: null,
            }),
          );

          const useCase = new TransactionRefundRequestedUseCase({
            appConfigRepo: mockedAppConfigRepo,
            atobaraiApiClientFactory,
            transactionRecordRepo,
          });

          const result = await useCase.execute({
            appId: mockedSaleorAppId,
            event: partialRefundEvent,
            saleorApiUrl: mockedSaleorApiUrl,
          });

          expect(result._unsafeUnwrap()).toBeInstanceOf(
            TransactionRefundRequestedUseCaseResponse.Failure,
          );
          expect(result._unsafeUnwrap().transactionResult).toBeInstanceOf(RefundFailureResult);
          expect(spy).toHaveBeenCalled();
        });
      });
    });
  });

  describe("after fulfillment refunds", () => {
    describe("full refund after fulfillment", () => {
      it("should successfully cancel transaction in NP Atobarai when full amount refund is requested after fulfillment", async () => {
        const event = {
          ...mockedRefundRequestedEvent,
        };

        const transactionRecordRepo = new MockedTransactionRecordRepo();

        // Create transaction record with fulfillment reported (tracking number present)
        transactionRecordRepo.createTransaction(
          {
            saleorApiUrl: mockedSaleorApiUrl,
            appId: mockedSaleorAppId,
          },
          new TransactionRecord({
            atobaraiTransactionId: mockedAtobaraiTransactionId,
            saleorTrackingNumber: "1234567890", // Fulfillment reported
            fulfillmentMetadataShippingCompanyCode: mockedAtobaraiShippingCompanyCode,
          }),
        );

        const mockCancelResponse = createAtobaraiCancelTransactionSuccessResponse({
          results: [
            {
              np_transaction_id: mockedAtobaraiTransactionId,
            },
          ],
        });

        const cancelSpy = vi
          .spyOn(mockedAtobaraiApiClient, "cancelTransaction")
          .mockResolvedValue(ok(mockCancelResponse));

        vi.spyOn(mockedAppConfigRepo, "getChannelConfig").mockImplementationOnce(() =>
          ok(mockedAppChannelConfig),
        );

        const useCase = new TransactionRefundRequestedUseCase({
          appConfigRepo: mockedAppConfigRepo,
          atobaraiApiClientFactory,
          transactionRecordRepo,
        });

        const result = await useCase.execute({
          appId: mockedSaleorAppId,
          event,
          saleorApiUrl: mockedSaleorApiUrl,
        });

        expect(result._unsafeUnwrap()).toBeInstanceOf(
          TransactionRefundRequestedUseCaseResponse.Success,
        );
        expect(result._unsafeUnwrap().transactionResult).toBeInstanceOf(RefundSuccessResult);

        expect(cancelSpy).toHaveBeenCalledWith(
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

      it("should return RefundFailureResult when cancel transaction fails after fulfillment", async () => {
        const event = {
          ...mockedRefundRequestedEvent,
        };

        const transactionRecordRepo = new MockedTransactionRecordRepo();

        transactionRecordRepo.createTransaction(
          {
            saleorApiUrl: mockedSaleorApiUrl,
            appId: mockedSaleorAppId,
          },
          new TransactionRecord({
            atobaraiTransactionId: mockedAtobaraiTransactionId,
            saleorTrackingNumber: "1234567890", // Fulfillment reported
            fulfillmentMetadataShippingCompanyCode: mockedAtobaraiShippingCompanyCode,
          }),
        );

        const cancelError = new AtobaraiApiClientCancelTransactionError("Cancel failed");

        const cancelSpy = vi
          .spyOn(mockedAtobaraiApiClient, "cancelTransaction")
          .mockResolvedValue(err(cancelError));

        vi.spyOn(mockedAppConfigRepo, "getChannelConfig").mockImplementationOnce(() =>
          ok(mockedAppChannelConfig),
        );

        const useCase = new TransactionRefundRequestedUseCase({
          appConfigRepo: mockedAppConfigRepo,
          atobaraiApiClientFactory,
          transactionRecordRepo,
        });

        const result = await useCase.execute({
          appId: mockedSaleorAppId,
          event,
          saleorApiUrl: mockedSaleorApiUrl,
        });

        expect(result._unsafeUnwrap()).toBeInstanceOf(
          TransactionRefundRequestedUseCaseResponse.Failure,
        );
        expect(result._unsafeUnwrap().transactionResult).toBeInstanceOf(RefundFailureResult);

        expect(cancelSpy).toHaveBeenCalledWith(
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
    });

    describe("partial refund with line items after fulfillment", () => {
      it("should successfully process partial refund with line items after fulfillment", async () => {
        const partialRefundEvent = {
          ...mockedRefundRequestedEvent,
          action: { amount: 1500, currency: "JPY" }, // Partial amount
          transaction: {
            ...mockedRefundRequestedEvent.transaction,
            order: {
              ...mockedRefundRequestedEvent.transaction.order,
              __typename: "Order" as const,
              total: {
                gross: {
                  amount: 3000, // Total order amount
                },
              },
              lines: [
                {
                  id: "line-1",
                  __typename: "OrderLine" as const,
                  quantity: 1,
                  unitPrice: {
                    gross: {
                      amount: 1000,
                    },
                  },
                  orderVariant: {
                    product: {
                      name: "Test Product",
                    },
                    sku: "TEST-SKU",
                  },
                },
              ],
              discount: {
                amount: 100,
              },
              shippingPrice: {
                gross: {
                  amount: 200,
                },
              },
              channel: {
                id: mockedRefundRequestedEvent.transaction.order.channel.id,
                slug: "default-channel",
                currencyCode: "JPY",
              },
              billingAddress: {
                firstName: "John",
                lastName: "Doe",
                phone: "+81123456789",
                country: {
                  code: "JP",
                },
                postalCode: "1000001",
                countryArea: "Tokyo",
                streetAddress1: "1-1-1 Shibuya",
                streetAddress2: "Apt 101",
                companyName: "Test Company",
                city: "Tokyo",
                cityArea: "Shibuya",
              },
              shippingAddress: {
                firstName: "John",
                lastName: "Doe",
                phone: "+81123456789",
                country: {
                  code: "JP",
                },
                postalCode: "1000001",
                countryArea: "Tokyo",
                streetAddress1: "1-1-1 Shibuya",
                streetAddress2: "Apt 101",
                companyName: "Test Company",
                city: "Tokyo",
                cityArea: "Shibuya",
              },
              userEmail: "test@example.com",
            },
          },
          grantedRefund: {
            lines: [
              {
                orderLine: {
                  id: "line-1",
                },
                quantity: 1,
              },
            ],
            shippingCostsIncluded: false,
          },
        };

        const transactionRecordRepo = new MockedTransactionRecordRepo();

        transactionRecordRepo.createTransaction(
          {
            saleorApiUrl: mockedSaleorApiUrl,
            appId: mockedSaleorAppId,
          },
          new TransactionRecord({
            atobaraiTransactionId: mockedAtobaraiTransactionId,
            saleorTrackingNumber: "1234567890", // Fulfillment reported
            fulfillmentMetadataShippingCompanyCode: mockedAtobaraiShippingCompanyCode,
          }),
        );

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

        const cancelSpy = vi
          .spyOn(mockedAtobaraiApiClient, "cancelTransaction")
          .mockResolvedValue(ok(mockCancelResponse));

        const registerSpy = vi
          .spyOn(mockedAtobaraiApiClient, "registerTransaction")
          .mockResolvedValue(ok(mockRegisterResponse));

        const fulfillmentSpy = vi
          .spyOn(mockedAtobaraiApiClient, "reportFulfillment")
          .mockResolvedValue(ok(mockFulfillmentResponse));

        vi.spyOn(mockedAppConfigRepo, "getChannelConfig").mockImplementationOnce(() =>
          ok(mockedAppChannelConfig),
        );

        const useCase = new TransactionRefundRequestedUseCase({
          appConfigRepo: mockedAppConfigRepo,
          atobaraiApiClientFactory,
          transactionRecordRepo,
        });

        const result = await useCase.execute({
          appId: mockedSaleorAppId,
          event: partialRefundEvent,
          saleorApiUrl: mockedSaleorApiUrl,
        });

        expect(result._unsafeUnwrap()).toBeInstanceOf(
          TransactionRefundRequestedUseCaseResponse.Success,
        );
        expect(result._unsafeUnwrap().transactionResult).toBeInstanceOf(RefundSuccessResult);

        expect(cancelSpy).toHaveBeenCalledTimes(1);
        expect(registerSpy).toHaveBeenCalledTimes(1);
        expect(fulfillmentSpy).toHaveBeenCalledTimes(1);

        // Verify the register transaction payload contains adjusted amount (total - refunded)
        const registerCallArgs = registerSpy.mock.calls[0][0];
        const expectedAmount = 3000 - 1500; // total - refunded

        expect(registerCallArgs.transactions[0].billed_amount).toBe(expectedAmount);

        // Verify fulfillment payload
        const fulfillmentCallArgs = fulfillmentSpy.mock.calls[0][0];

        expect(fulfillmentCallArgs.transactions[0].np_transaction_id).toBe("12345678901");
        expect(fulfillmentCallArgs.transactions[0].slip_no).toBe("1234567890");
        expect(fulfillmentCallArgs.transactions[0].pd_company_code).toBe(
          mockedAtobaraiShippingCompanyCode,
        );
      });

      it("should return RefundFailureResult when register transaction fails after fulfillment", async () => {
        const partialRefundEvent = {
          ...mockedRefundRequestedEvent,
          action: { amount: 1500, currency: "JPY" },
          transaction: {
            ...mockedRefundRequestedEvent.transaction,
            order: {
              ...mockedRefundRequestedEvent.transaction.order,
              __typename: "Order" as const,
              total: {
                gross: {
                  amount: 3000,
                },
              },
              billingAddress: {
                firstName: "John",
                lastName: "Doe",
                phone: "+81123456789",
                country: {
                  code: "JP",
                },
                postalCode: "1000001",
                countryArea: "Tokyo",
                streetAddress1: "1-1-1 Shibuya",
                streetAddress2: "Apt 101",
                companyName: "Test Company",
                city: "Tokyo",
                cityArea: "Shibuya",
              },
              shippingAddress: {
                firstName: "John",
                lastName: "Doe",
                phone: "+81123456789",
                country: {
                  code: "JP",
                },
                postalCode: "1000001",
                countryArea: "Tokyo",
                streetAddress1: "1-1-1 Shibuya",
                streetAddress2: "Apt 101",
                companyName: "Test Company",
                city: "Tokyo",
                cityArea: "Shibuya",
              },
              userEmail: "test@example.com",
            },
          },
          grantedRefund: {
            lines: [
              {
                orderLine: {
                  id: "line-1",
                },
                quantity: 1,
              },
            ],
            shippingCostsIncluded: false,
          },
        };

        const transactionRecordRepo = new MockedTransactionRecordRepo();

        transactionRecordRepo.createTransaction(
          {
            saleorApiUrl: mockedSaleorApiUrl,
            appId: mockedSaleorAppId,
          },
          new TransactionRecord({
            atobaraiTransactionId: mockedAtobaraiTransactionId,
            saleorTrackingNumber: "1234567890", // Fulfillment reported
            fulfillmentMetadataShippingCompanyCode: mockedAtobaraiShippingCompanyCode,
          }),
        );

        const mockCancelResponse = createAtobaraiCancelTransactionSuccessResponse({
          results: [{ np_transaction_id: mockedAtobaraiTransactionId }],
        });

        const registerError = new AtobaraiApiClientRegisterTransactionError("Register failed");

        const cancelSpy = vi
          .spyOn(mockedAtobaraiApiClient, "cancelTransaction")
          .mockResolvedValue(ok(mockCancelResponse));

        const registerSpy = vi
          .spyOn(mockedAtobaraiApiClient, "registerTransaction")
          .mockResolvedValue(err(registerError));

        vi.spyOn(mockedAppConfigRepo, "getChannelConfig").mockImplementationOnce(() =>
          ok(mockedAppChannelConfig),
        );

        const useCase = new TransactionRefundRequestedUseCase({
          appConfigRepo: mockedAppConfigRepo,
          atobaraiApiClientFactory,
          transactionRecordRepo,
        });

        const result = await useCase.execute({
          appId: mockedSaleorAppId,
          event: partialRefundEvent,
          saleorApiUrl: mockedSaleorApiUrl,
        });

        expect(result._unsafeUnwrap()).toBeInstanceOf(
          TransactionRefundRequestedUseCaseResponse.Failure,
        );
        expect(result._unsafeUnwrap().transactionResult).toBeInstanceOf(RefundFailureResult);

        expect(cancelSpy).toHaveBeenCalledTimes(1);
        expect(registerSpy).toHaveBeenCalledTimes(1);
      });

      it("should return RefundFailureResult when fulfillment report fails after fulfillment", async () => {
        const partialRefundEvent = {
          ...mockedRefundRequestedEvent,
          action: { amount: 1500, currency: "JPY" },
          transaction: {
            ...mockedRefundRequestedEvent.transaction,
            order: {
              ...mockedRefundRequestedEvent.transaction.order,
              __typename: "Order" as const,
              total: {
                gross: {
                  amount: 3000,
                },
              },
              billingAddress: {
                firstName: "John",
                lastName: "Doe",
                phone: "+81123456789",
                country: {
                  code: "JP",
                },
                postalCode: "1000001",
                countryArea: "Tokyo",
                streetAddress1: "1-1-1 Shibuya",
                streetAddress2: "Apt 101",
                companyName: "Test Company",
                city: "Tokyo",
                cityArea: "Shibuya",
              },
              shippingAddress: {
                firstName: "John",
                lastName: "Doe",
                phone: "+81123456789",
                country: {
                  code: "JP",
                },
                postalCode: "1000001",
                countryArea: "Tokyo",
                streetAddress1: "1-1-1 Shibuya",
                streetAddress2: "Apt 101",
                companyName: "Test Company",
                city: "Tokyo",
                cityArea: "Shibuya",
              },
              userEmail: "test@example.com",
            },
          },
          grantedRefund: {
            lines: [
              {
                orderLine: {
                  id: "line-1",
                },
                quantity: 1,
              },
            ],
            shippingCostsIncluded: false,
          },
        };

        const transactionRecordRepo = new MockedTransactionRecordRepo();

        transactionRecordRepo.createTransaction(
          {
            saleorApiUrl: mockedSaleorApiUrl,
            appId: mockedSaleorAppId,
          },
          new TransactionRecord({
            atobaraiTransactionId: mockedAtobaraiTransactionId,
            saleorTrackingNumber: "1234567890", // Fulfillment reported
            fulfillmentMetadataShippingCompanyCode: mockedAtobaraiShippingCompanyCode,
          }),
        );

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

        const fulfillmentError = new AtobaraiApiClientFulfillmentReportError("Fulfillment failed");

        const cancelSpy = vi
          .spyOn(mockedAtobaraiApiClient, "cancelTransaction")
          .mockResolvedValue(ok(mockCancelResponse));

        const registerSpy = vi
          .spyOn(mockedAtobaraiApiClient, "registerTransaction")
          .mockResolvedValue(ok(mockRegisterResponse));

        const fulfillmentSpy = vi
          .spyOn(mockedAtobaraiApiClient, "reportFulfillment")
          .mockResolvedValue(err(fulfillmentError));

        vi.spyOn(mockedAppConfigRepo, "getChannelConfig").mockImplementationOnce(() =>
          ok(mockedAppChannelConfig),
        );

        const useCase = new TransactionRefundRequestedUseCase({
          appConfigRepo: mockedAppConfigRepo,
          atobaraiApiClientFactory,
          transactionRecordRepo,
        });

        const result = await useCase.execute({
          appId: mockedSaleorAppId,
          event: partialRefundEvent,
          saleorApiUrl: mockedSaleorApiUrl,
        });

        expect(result._unsafeUnwrap()).toBeInstanceOf(
          TransactionRefundRequestedUseCaseResponse.Failure,
        );
        expect(result._unsafeUnwrap().transactionResult).toBeInstanceOf(RefundFailureResult);

        expect(cancelSpy).toHaveBeenCalledTimes(1);
        expect(registerSpy).toHaveBeenCalledTimes(1);
        expect(fulfillmentSpy).toHaveBeenCalledTimes(1);
      });
    });

    describe("partial refund without line items after fulfillment", () => {
      it("should successfully process partial refund without line items after fulfillment", async () => {
        const partialRefundEvent = {
          ...mockedRefundRequestedEvent,
          action: { amount: 1500, currency: "JPY" }, // Partial amount
          transaction: {
            ...mockedRefundRequestedEvent.transaction,
            order: {
              ...mockedRefundRequestedEvent.transaction.order,
              __typename: "Order" as const,
              total: {
                gross: {
                  amount: 3000, // Total order amount
                },
              },
              lines: [
                {
                  id: "line-1",
                  __typename: "OrderLine" as const,
                  quantity: 2,
                  unitPrice: {
                    gross: {
                      amount: 1000,
                    },
                  },
                  orderVariant: {
                    product: {
                      name: "Test Product",
                    },
                    sku: "TEST-SKU",
                  },
                },
              ],
              discount: {
                amount: 100,
              },
              shippingPrice: {
                gross: {
                  amount: 200,
                },
              },
              channel: {
                id: mockedRefundRequestedEvent.transaction.order.channel.id,
                slug: "default-channel",
                currencyCode: "JPY",
              },
              billingAddress: {
                firstName: "John",
                lastName: "Doe",
                phone: "+81123456789",
                country: {
                  code: "JP",
                },
                postalCode: "1000001",
                countryArea: "Tokyo",
                streetAddress1: "1-1-1 Shibuya",
                streetAddress2: "Apt 101",
                companyName: "Test Company",
                city: "Tokyo",
                cityArea: "Shibuya",
              },
              shippingAddress: {
                firstName: "John",
                lastName: "Doe",
                phone: "+81123456789",
                country: {
                  code: "JP",
                },
                postalCode: "1000001",
                countryArea: "Tokyo",
                streetAddress1: "1-1-1 Shibuya",
                streetAddress2: "Apt 101",
                companyName: "Test Company",
                city: "Tokyo",
                cityArea: "Shibuya",
              },
              userEmail: "test@example.com",
            },
          },
          grantedRefund: null, // No line items specified
        };

        const transactionRecordRepo = new MockedTransactionRecordRepo();

        transactionRecordRepo.createTransaction(
          {
            saleorApiUrl: mockedSaleorApiUrl,
            appId: mockedSaleorAppId,
          },
          new TransactionRecord({
            atobaraiTransactionId: mockedAtobaraiTransactionId,
            saleorTrackingNumber: "1234567890", // Fulfillment reported
            fulfillmentMetadataShippingCompanyCode: mockedAtobaraiShippingCompanyCode,
          }),
        );

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

        const cancelSpy = vi
          .spyOn(mockedAtobaraiApiClient, "cancelTransaction")
          .mockResolvedValue(ok(mockCancelResponse));

        const registerSpy = vi
          .spyOn(mockedAtobaraiApiClient, "registerTransaction")
          .mockResolvedValue(ok(mockRegisterResponse));

        const fulfillmentSpy = vi
          .spyOn(mockedAtobaraiApiClient, "reportFulfillment")
          .mockResolvedValue(ok(mockFulfillmentResponse));

        vi.spyOn(mockedAppConfigRepo, "getChannelConfig").mockImplementationOnce(() =>
          ok(mockedAppChannelConfig),
        );

        const useCase = new TransactionRefundRequestedUseCase({
          appConfigRepo: mockedAppConfigRepo,
          atobaraiApiClientFactory,
          transactionRecordRepo,
        });

        const result = await useCase.execute({
          appId: mockedSaleorAppId,
          event: partialRefundEvent,
          saleorApiUrl: mockedSaleorApiUrl,
        });

        expect(result._unsafeUnwrap()).toBeInstanceOf(
          TransactionRefundRequestedUseCaseResponse.Success,
        );
        expect(result._unsafeUnwrap().transactionResult).toBeInstanceOf(RefundSuccessResult);

        expect(cancelSpy).toHaveBeenCalledTimes(1);
        expect(registerSpy).toHaveBeenCalledTimes(1);
        expect(fulfillmentSpy).toHaveBeenCalledTimes(1);

        // Verify the register transaction payload contains adjusted amount (total - refunded)
        const registerCallArgs = registerSpy.mock.calls[0][0];
        const expectedAmount = 3000 - 1500; // total - refunded

        expect(registerCallArgs.transactions[0].billed_amount).toBe(expectedAmount);

        // Verify fulfillment payload
        const fulfillmentCallArgs = fulfillmentSpy.mock.calls[0][0];

        expect(fulfillmentCallArgs.transactions[0].np_transaction_id).toBe("12345678901");
        expect(fulfillmentCallArgs.transactions[0].slip_no).toBe("1234567890");
        expect(fulfillmentCallArgs.transactions[0].pd_company_code).toBe(
          mockedAtobaraiShippingCompanyCode,
        );
      });
    });
  });
});
