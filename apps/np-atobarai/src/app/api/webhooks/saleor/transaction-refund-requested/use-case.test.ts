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

    expect(spy).toHaveBeenCalledWith({
      transactions: [
        {
          np_transaction_id: mockedAtobaraiTransactionId,
        },
      ],
    });
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
    expect(spy).toHaveBeenCalledWith({
      transactions: [
        {
          np_transaction_id: mockedAtobaraiTransactionId,
        },
      ],
    });
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

  it.todo("partial refunds");
});
