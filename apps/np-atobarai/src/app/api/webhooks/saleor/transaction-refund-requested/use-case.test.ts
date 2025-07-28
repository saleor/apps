import { err, ok } from "neverthrow";
import { describe, expect, it, vi } from "vitest";

import { mockedAppChannelConfig } from "@/__tests__/mocks/app-config/mocked-app-config";
import { mockedAppConfigRepo } from "@/__tests__/mocks/app-config/mocked-app-config-repo";
import { MockedTransactionRecordRepo } from "@/__tests__/mocks/app-transaction/mocked-transaction-record-repo";
import { mockedAtobaraiApiClient } from "@/__tests__/mocks/atobarai/api/mocked-atobarai-api-client";
import { mockedAtobaraiTransactionId } from "@/__tests__/mocks/atobarai/mocked-atobarai-transaction-id";
import { mockedSaleorApiUrl } from "@/__tests__/mocks/saleor/mocked-saleor-api-url";
import { mockedSaleorAppId } from "@/__tests__/mocks/saleor/mocked-saleor-app-id";
import { mockedRefundRequestedEvent } from "@/__tests__/mocks/saleor-events/mocked-refund-requested-event";
import { createAtobaraiCancelTransactionSuccessResponse } from "@/modules/atobarai/api/atobarai-cancel-transaction-success-response";
import {
  AtobaraiApiClientCancelTransactionError,
  IAtobaraiApiClientFactory,
} from "@/modules/atobarai/api/types";
import {
  RefundFailureResult,
  RefundSuccessResult,
} from "@/modules/transaction-result/refund-result";
import { TransactionRecord } from "@/modules/transactions-recording/transaction-record";

import { MalformedRequestResponse } from "../saleor-webhook-responses";
import { TransactionRefundRequestedUseCase } from "./use-case";
import { TransactionRefundRequestedUseCaseResponse } from "./use-case-response";

describe("TransactionRefundRequestedUseCase", () => {
  const atobaraiApiClientFactory = {
    create: () => mockedAtobaraiApiClient,
  } satisfies IAtobaraiApiClientFactory;

  it("should return MalformedRequestResponse when action amount is missing", async () => {
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
      event,
      saleorApiUrl: mockedSaleorApiUrl,
    });

    expect(result._unsafeUnwrapErr()).toBeInstanceOf(MalformedRequestResponse);
  });

  it("should return MalformedRequestResponse when transaction is missing", async () => {
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

    expect(result._unsafeUnwrapErr()).toBeInstanceOf(MalformedRequestResponse);
  });

  it("should return MalformedRequestResponse when total amount is missing from both checkout and order", async () => {
    const event = {
      ...mockedRefundRequestedEvent,
      transaction: {
        pspReference: mockedAtobaraiTransactionId,
        token: "saleor-transaction-token",
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

    expect(result._unsafeUnwrapErr()).toBeInstanceOf(MalformedRequestResponse);
  });

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
        checkForMultipleResults: true,
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
        checkForMultipleResults: true,
      },
    );
  });

  it("should return RefundFailureResult when cancel transaction returns multiple results", async () => {
    const event = {
      ...mockedRefundRequestedEvent,
    };

    const mockCancelResponse = createAtobaraiCancelTransactionSuccessResponse({
      results: [
        {
          np_transaction_id: mockedAtobaraiTransactionId,
        },
        {
          np_transaction_id: "np_trans_21",
        },
      ],
    });

    vi.spyOn(mockedAtobaraiApiClient, "cancelTransaction").mockResolvedValue(
      ok(mockCancelResponse),
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
  });

  describe("partial refunds", () => {
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
                postalCode: "1234567",
                countryArea: "Tokyo",
                streetAddress1: "1-1-1 Shibuya",
                streetAddress2: "Apt 101",
                companyName: "Test Company",
              },
              shippingAddress: {
                firstName: "John",
                lastName: "Doe",
                phone: "+81123456789",
                country: {
                  code: "JP",
                },
                postalCode: "1234567",
                countryArea: "Tokyo",
                streetAddress1: "1-1-1 Shibuya",
                streetAddress2: "Apt 101",
                companyName: "Test Company",
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
        expect(spy).toHaveBeenCalledWith({
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
                  goods_price: 100,
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
        });
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
                postalCode: "1234567",
                countryArea: "Tokyo",
                streetAddress1: "1-1-1 Shibuya",
                streetAddress2: "Apt 101",
                companyName: "Test Company",
              },
              shippingAddress: {
                firstName: "John",
                lastName: "Doe",
                phone: "+81123456789",
                country: {
                  code: "JP",
                },
                postalCode: "1234567",
                countryArea: "Tokyo",
                streetAddress1: "1-1-1 Shibuya",
                streetAddress2: "Apt 101",
                companyName: "Test Company",
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
        expect(spy).toHaveBeenCalledWith({
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
                  goods_price: 100,
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
                address: "Tokyo1-1-1 ShibuyaApt 101",
                company_name: "Test Company",
                customer_name: "Doe John",
                email: "test@example.com",
                tel: "0123456789",
                zip_code: "1234567",
              },
              dest_customer: {
                address: "Tokyo1-1-1 ShibuyaApt 101",
                company_name: "Test Company",
                customer_name: "Doe John",
                tel: "0123456789",
                zip_code: "1234567",
              },
            },
          ],
        });
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
                postalCode: "1234567",
                countryArea: "Tokyo",
                streetAddress1: "1-1-1 Shibuya",
                streetAddress2: "Apt 101",
                companyName: "Test Company",
              },
              shippingAddress: {
                firstName: "John",
                lastName: "Doe",
                phone: "+81123456789",
                country: {
                  code: "JP",
                },
                postalCode: "1234567",
                countryArea: "Tokyo",
                streetAddress1: "1-1-1 Shibuya",
                streetAddress2: "Apt 101",
                companyName: "Test Company",
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
        expect(spy).toHaveBeenCalledWith({
          transactions: [
            {
              dest_customer: {
                address: "Tokyo1-1-1 ShibuyaApt 101",
                company_name: "Test Company",
                customer_name: "Doe John",
                tel: "0123456789",
                zip_code: "1234567",
              },
              billed_amount: 1300,
              settlement_type: "02",
              shop_order_date: "2023-01-01",
              shop_transaction_id: "saleor-transaction-token",
              np_transaction_id: mockedAtobaraiTransactionId,
              customer: {
                address: "Tokyo1-1-1 ShibuyaApt 101",
                company_name: "Test Company",
                customer_name: "Doe John",
                email: "test@example.com",
                tel: "0123456789",
                zip_code: "1234567",
              },
              goods: [
                {
                  goods_name: "SKU-1", // Uses SKU because skuAsName is true
                  goods_price: 1000,
                  quantity: 1, // 2 - 1 = 1 remaining
                },
                {
                  goods_name: "Voucher",
                  goods_price: 50,
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
        });
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
                postalCode: "1234567",
                countryArea: "Tokyo",
                streetAddress1: "1-1-1 Shibuya",
                streetAddress2: "Apt 101",
                companyName: "Test Company",
              },
              shippingAddress: {
                firstName: "John",
                lastName: "Doe",
                phone: "+81123456789",
                country: {
                  code: "JP",
                },
                postalCode: "1234567",
                countryArea: "Tokyo",
                streetAddress1: "1-1-1 Shibuya",
                streetAddress2: "Apt 101",
                companyName: "Test Company",
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
