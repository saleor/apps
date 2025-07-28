import { BaseError } from "@saleor/errors";
import { err, ok } from "neverthrow";
import { describe, expect, it, vi } from "vitest";

import { mockedAppChannelConfig } from "@/__tests__/mocks/app-config/mocked-app-config";
import { mockedAppConfigRepo } from "@/__tests__/mocks/app-config/mocked-app-config-repo";
import { MockedTransactionRecordRepo } from "@/__tests__/mocks/app-transaction/mocked-transaction-record-repo";
import { mockedAtobaraiApiClient } from "@/__tests__/mocks/atobarai/api/mocked-atobarai-api-client";
import { mockedAtobaraiTransactionId } from "@/__tests__/mocks/atobarai/mocked-atobarai-transaction-id";
import { mockedSaleorApiUrl } from "@/__tests__/mocks/saleor/mocked-saleor-api-url";
import { mockedSaleorAppId } from "@/__tests__/mocks/saleor/mocked-saleor-app-id";
import { mockedTransactionInitializeSessionEvent } from "@/__tests__/mocks/saleor-events/mocked-transaction-initialize-session-event";
import {
  createAtobaraiTransactionSuccessResponse,
  CreditCheckResult,
  FailedReason,
  PendingReason,
} from "@/modules/atobarai/api/atobarai-transaction-success-response";
import {
  AtobaraiApiClientRegisterTransactionError,
  IAtobaraiApiClientFactory,
} from "@/modules/atobarai/api/types";
import {
  ChargeActionRequiredResult,
  ChargeFailureResult,
  ChargeSuccessResult,
} from "@/modules/transaction-result/charge-result";
import { TransactionRecordRepoError } from "@/modules/transactions-recording/types";

import {
  AppIsNotConfiguredResponse,
  BrokenAppResponse,
  MalformedRequestResponse,
} from "../saleor-webhook-responses";
import { TransactionInitializeSessionUseCase } from "./use-case";
import { TransactionInitializeSessionUseCaseResponse } from "./use-case-response";

describe("TransactionInitializeSessionUseCase", () => {
  const atobaraiApiClientFactory = {
    create: () => mockedAtobaraiApiClient,
  } satisfies IAtobaraiApiClientFactory;

  it("should return Success response with ChargeSuccessResult when Atobarai returns CreditCheckResult.Success", async () => {
    const mockPassedTransaction = createAtobaraiTransactionSuccessResponse({
      results: [
        {
          np_transaction_id: mockedAtobaraiTransactionId,
          authori_result: CreditCheckResult.Success,
        },
      ],
    });

    vi.spyOn(mockedAtobaraiApiClient, "registerTransaction").mockResolvedValue(
      ok(mockPassedTransaction),
    );

    vi.spyOn(mockedAppConfigRepo, "getChannelConfig").mockImplementationOnce(() =>
      ok(mockedAppChannelConfig),
    );

    const uc = new TransactionInitializeSessionUseCase({
      appConfigRepo: mockedAppConfigRepo,
      atobaraiApiClientFactory,
      appTransactionRepo: new MockedTransactionRecordRepo(),
    });

    const responsePayload = await uc.execute({
      saleorApiUrl: mockedSaleorApiUrl,
      appId: mockedSaleorAppId,
      event: mockedTransactionInitializeSessionEvent,
    });

    expect(responsePayload._unsafeUnwrap()).toBeInstanceOf(
      TransactionInitializeSessionUseCaseResponse.Success,
    );

    expect(responsePayload._unsafeUnwrap().transactionResult).toBeInstanceOf(ChargeSuccessResult);
  });

  it("should return Success response with ChargeActionRequiredResult when Atobarai returns CreditCheckResult.Pending", async () => {
    const mockPendingTransaction = createAtobaraiTransactionSuccessResponse({
      results: [
        {
          np_transaction_id: mockedAtobaraiTransactionId,
          authori_result: CreditCheckResult.Pending,
          authori_hold: [PendingReason.LackOfAddressInformation],
        },
      ],
    });

    vi.spyOn(mockedAtobaraiApiClient, "registerTransaction").mockResolvedValue(
      ok(mockPendingTransaction),
    );

    vi.spyOn(mockedAppConfigRepo, "getChannelConfig").mockImplementationOnce(() =>
      ok(mockedAppChannelConfig),
    );

    const uc = new TransactionInitializeSessionUseCase({
      appConfigRepo: mockedAppConfigRepo,
      atobaraiApiClientFactory,
      appTransactionRepo: new MockedTransactionRecordRepo(),
    });

    const responsePayload = await uc.execute({
      saleorApiUrl: mockedSaleorApiUrl,
      appId: mockedSaleorAppId,
      event: mockedTransactionInitializeSessionEvent,
    });

    expect(responsePayload._unsafeUnwrap()).toBeInstanceOf(
      TransactionInitializeSessionUseCaseResponse.Success,
    );

    expect(responsePayload._unsafeUnwrap().transactionResult).toBeInstanceOf(
      ChargeActionRequiredResult,
    );
  });

  it("should return Failure response with ChargeFailureResult when Atobarai returns CreditCheckResult.Failed", async () => {
    const mockFailedTransaction = createAtobaraiTransactionSuccessResponse({
      results: [
        {
          np_transaction_id: mockedAtobaraiTransactionId,
          authori_result: CreditCheckResult.Failed,
          authori_ng: FailedReason.ExcessOfTheAmount,
        },
      ],
    });

    vi.spyOn(mockedAtobaraiApiClient, "registerTransaction").mockResolvedValue(
      ok(mockFailedTransaction),
    );

    vi.spyOn(mockedAppConfigRepo, "getChannelConfig").mockImplementationOnce(() =>
      ok(mockedAppChannelConfig),
    );

    const uc = new TransactionInitializeSessionUseCase({
      appConfigRepo: mockedAppConfigRepo,
      atobaraiApiClientFactory,
      appTransactionRepo: new MockedTransactionRecordRepo(),
    });

    const responsePayload = await uc.execute({
      saleorApiUrl: mockedSaleorApiUrl,
      appId: mockedSaleorAppId,
      event: mockedTransactionInitializeSessionEvent,
    });

    expect(responsePayload._unsafeUnwrap()).toBeInstanceOf(
      TransactionInitializeSessionUseCaseResponse.Failure,
    );

    expect(responsePayload._unsafeUnwrap().transactionResult).toBeInstanceOf(ChargeFailureResult);
  });

  it("should return Failure response with ChargeFailureResult when Atobarai returns CreditCheckResult.BeforeReview", async () => {
    const mockBeforeReviewTransaction = createAtobaraiTransactionSuccessResponse({
      results: [
        {
          np_transaction_id: mockedAtobaraiTransactionId,
          authori_result: CreditCheckResult.BeforeReview,
        },
      ],
    });

    vi.spyOn(mockedAtobaraiApiClient, "registerTransaction").mockResolvedValue(
      ok(mockBeforeReviewTransaction),
    );

    vi.spyOn(mockedAppConfigRepo, "getChannelConfig").mockImplementationOnce(() =>
      ok(mockedAppChannelConfig),
    );

    const uc = new TransactionInitializeSessionUseCase({
      appConfigRepo: mockedAppConfigRepo,
      atobaraiApiClientFactory,
      appTransactionRepo: new MockedTransactionRecordRepo(),
    });

    const responsePayload = await uc.execute({
      saleorApiUrl: mockedSaleorApiUrl,
      appId: mockedSaleorAppId,
      event: mockedTransactionInitializeSessionEvent,
    });

    expect(responsePayload._unsafeUnwrap()).toBeInstanceOf(
      TransactionInitializeSessionUseCaseResponse.Failure,
    );

    expect(responsePayload._unsafeUnwrap().transactionResult).toBeInstanceOf(ChargeFailureResult);
  });

  it("should return Failure response when Atobarai API returns an error", async () => {
    const mockApiError = new AtobaraiApiClientRegisterTransactionError("API Error");

    vi.spyOn(mockedAtobaraiApiClient, "registerTransaction").mockResolvedValue(err(mockApiError));

    vi.spyOn(mockedAppConfigRepo, "getChannelConfig").mockImplementationOnce(() =>
      ok(mockedAppChannelConfig),
    );

    const uc = new TransactionInitializeSessionUseCase({
      appConfigRepo: mockedAppConfigRepo,
      atobaraiApiClientFactory,
      appTransactionRepo: new MockedTransactionRecordRepo(),
    });

    const responsePayload = await uc.execute({
      saleorApiUrl: mockedSaleorApiUrl,
      appId: mockedSaleorAppId,
      event: mockedTransactionInitializeSessionEvent,
    });

    expect(responsePayload._unsafeUnwrap()).toBeInstanceOf(
      TransactionInitializeSessionUseCaseResponse.Failure,
    );
  });

  it("should return MalformedRequestResponse when event is missing issuedAt", async () => {
    const eventWithoutIssuedAt = {
      ...mockedTransactionInitializeSessionEvent,
      issuedAt: null,
    };

    vi.spyOn(mockedAppConfigRepo, "getChannelConfig").mockImplementationOnce(() =>
      ok(mockedAppChannelConfig),
    );

    const uc = new TransactionInitializeSessionUseCase({
      appConfigRepo: mockedAppConfigRepo,
      atobaraiApiClientFactory,
      appTransactionRepo: new MockedTransactionRecordRepo(),
    });

    const responsePayload = await uc.execute({
      saleorApiUrl: mockedSaleorApiUrl,
      appId: mockedSaleorAppId,
      event: eventWithoutIssuedAt,
    });

    expect(responsePayload._unsafeUnwrapErr()).toBeInstanceOf(MalformedRequestResponse);
  });

  it("should return AppIsNotConfiguredResponse if config not found for specified channel", async () => {
    vi.spyOn(mockedAppConfigRepo, "getChannelConfig").mockImplementationOnce(() => ok(null));

    const uc = new TransactionInitializeSessionUseCase({
      appConfigRepo: mockedAppConfigRepo,
      atobaraiApiClientFactory,
      appTransactionRepo: new MockedTransactionRecordRepo(),
    });

    const responsePayload = await uc.execute({
      saleorApiUrl: mockedSaleorApiUrl,
      appId: mockedSaleorAppId,
      event: mockedTransactionInitializeSessionEvent,
    });

    expect(responsePayload._unsafeUnwrapErr()).toBeInstanceOf(AppIsNotConfiguredResponse);
  });

  it("should return AppIsNotConfiguredResponse if there is an error fetching config", async () => {
    const configError = new BaseError("Failed to fetch config");

    vi.spyOn(mockedAppConfigRepo, "getChannelConfig").mockImplementationOnce(() =>
      err(configError),
    );

    const uc = new TransactionInitializeSessionUseCase({
      appConfigRepo: mockedAppConfigRepo,
      atobaraiApiClientFactory,
      appTransactionRepo: new MockedTransactionRecordRepo(),
    });

    const responsePayload = await uc.execute({
      saleorApiUrl: mockedSaleorApiUrl,
      appId: mockedSaleorAppId,
      event: mockedTransactionInitializeSessionEvent,
    });

    expect(responsePayload._unsafeUnwrapErr()).toBeInstanceOf(AppIsNotConfiguredResponse);
  });

  it("should return BrokenAppResponse when AppTransactionRepo fails to create transaction", async () => {
    vi.spyOn(mockedAtobaraiApiClient, "registerTransaction").mockResolvedValue(
      ok(
        createAtobaraiTransactionSuccessResponse({
          results: [
            {
              np_transaction_id: mockedAtobaraiTransactionId,
              authori_result: CreditCheckResult.Success,
            },
          ],
        }),
      ),
    );

    vi.spyOn(mockedAppConfigRepo, "getChannelConfig").mockImplementationOnce(() =>
      ok(mockedAppChannelConfig),
    );

    const mockedTransactionRecordRepo = new MockedTransactionRecordRepo();

    vi.spyOn(mockedTransactionRecordRepo, "createTransaction").mockImplementationOnce(async () =>
      err(
        new TransactionRecordRepoError.FailedWritingTransactionError(
          "Failed to create transaction",
        ),
      ),
    );

    const uc = new TransactionInitializeSessionUseCase({
      appConfigRepo: mockedAppConfigRepo,
      atobaraiApiClientFactory,
      appTransactionRepo: mockedTransactionRecordRepo,
    });

    const responsePayload = await uc.execute({
      saleorApiUrl: mockedSaleorApiUrl,
      appId: mockedSaleorAppId,
      event: mockedTransactionInitializeSessionEvent,
    });

    expect(responsePayload._unsafeUnwrapErr()).toBeInstanceOf(BrokenAppResponse);
  });
});
