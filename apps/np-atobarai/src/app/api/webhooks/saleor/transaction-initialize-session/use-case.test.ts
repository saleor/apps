import { BaseError } from "@saleor/errors";
import { err, ok } from "neverthrow";
import { describe, expect, it, vi } from "vitest";

import { mockedAppChannelConfig } from "@/__tests__/mocks/app-config/mocked-app-config";
import { mockedAppConfigRepo } from "@/__tests__/mocks/app-config/mocked-app-config-repo";
import { mockedSaleorApiUrl } from "@/__tests__/mocks/saleor/mocked-saleor-api-url";
import { mockedSaleorAppId } from "@/__tests__/mocks/saleor/mocked-saleor-app-id";
import { mockedTransactionInitializeSessionEvent } from "@/__tests__/mocks/saleor-events/mocked-transaction-initialize-session-event";
import {
  createAtobaraiTransactionSuccessResponse,
  CreditCheckResult,
  FailedReason,
  PendingReason,
} from "@/modules/atobarai/atobarai-transaction-success-response";
import {
  AtobaraiApiClientRegisterTransactionError,
  IAtobaraiApiClient,
  IAtobaraiApiClientFactory,
} from "@/modules/atobarai/types";
import {
  ChargeActionRequiredResult,
  ChargeFailureResult,
  ChargeSuccessResult,
} from "@/modules/transaction-result/charge-result";

import { AppIsNotConfiguredResponse, MalformedRequestResponse } from "../saleor-webhook-responses";
import { TransactionInitializeSessionUseCase } from "./use-case";
import { TransactionInitializeSessionUseCaseResponse } from "./use-case-response";

describe("TransactionInitializeSessionUseCase", () => {
  const createMockedApiClient = (): IAtobaraiApiClient => ({
    registerTransaction: vi.fn(),
    changeTransaction: vi.fn(),
    verifyCredentials: vi.fn(),
    reportFulfillment: vi.fn(),
  });

  const createMockedApiClientFactory = (
    apiClient: IAtobaraiApiClient,
  ): IAtobaraiApiClientFactory => ({
    create: vi.fn().mockReturnValue(apiClient),
  });

  it("should return Success response with ChargeSuccessResult when Atobarai returns CreditCheckResult.Success", async () => {
    const mockPassedTransaction = createAtobaraiTransactionSuccessResponse({
      results: [
        {
          np_transaction_id: "test-transaction-id",
          authori_result: CreditCheckResult.Success,
        },
      ],
    });

    const mockedApiClient = createMockedApiClient();

    vi.mocked(mockedApiClient.registerTransaction).mockResolvedValue(ok(mockPassedTransaction));

    const mockedApiClientFactory = createMockedApiClientFactory(mockedApiClient);

    vi.spyOn(mockedAppConfigRepo, "getChannelConfig").mockImplementationOnce(() =>
      ok(mockedAppChannelConfig),
    );

    const uc = new TransactionInitializeSessionUseCase({
      appConfigRepo: mockedAppConfigRepo,
      atobaraiApiClientFactory: mockedApiClientFactory,
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
          np_transaction_id: "test-pending-transaction-id",
          authori_result: CreditCheckResult.Pending,
          authori_hold: [PendingReason.LackOfAddressInformation],
        },
      ],
    });

    const mockedApiClient = createMockedApiClient();

    vi.mocked(mockedApiClient.registerTransaction).mockResolvedValue(ok(mockPendingTransaction));

    const mockedApiClientFactory = createMockedApiClientFactory(mockedApiClient);

    vi.spyOn(mockedAppConfigRepo, "getChannelConfig").mockImplementationOnce(() =>
      ok(mockedAppChannelConfig),
    );

    const uc = new TransactionInitializeSessionUseCase({
      appConfigRepo: mockedAppConfigRepo,
      atobaraiApiClientFactory: mockedApiClientFactory,
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
          np_transaction_id: "test-failed-transaction-id",
          authori_result: CreditCheckResult.Failed,
          authori_ng: FailedReason.ExcessOfTheAmount,
        },
      ],
    });

    const mockedApiClient = createMockedApiClient();

    vi.mocked(mockedApiClient.registerTransaction).mockResolvedValue(ok(mockFailedTransaction));

    const mockedApiClientFactory = createMockedApiClientFactory(mockedApiClient);

    vi.spyOn(mockedAppConfigRepo, "getChannelConfig").mockImplementationOnce(() =>
      ok(mockedAppChannelConfig),
    );

    const uc = new TransactionInitializeSessionUseCase({
      appConfigRepo: mockedAppConfigRepo,
      atobaraiApiClientFactory: mockedApiClientFactory,
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
          np_transaction_id: "test-before-review-transaction-id",
          authori_result: CreditCheckResult.BeforeReview,
        },
      ],
    });

    const mockedApiClient = createMockedApiClient();

    vi.mocked(mockedApiClient.registerTransaction).mockResolvedValue(
      ok(mockBeforeReviewTransaction),
    );

    const mockedApiClientFactory = createMockedApiClientFactory(mockedApiClient);

    vi.spyOn(mockedAppConfigRepo, "getChannelConfig").mockImplementationOnce(() =>
      ok(mockedAppChannelConfig),
    );

    const uc = new TransactionInitializeSessionUseCase({
      appConfigRepo: mockedAppConfigRepo,
      atobaraiApiClientFactory: mockedApiClientFactory,
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

    const mockedApiClient = createMockedApiClient();

    vi.mocked(mockedApiClient.registerTransaction).mockResolvedValue(err(mockApiError));

    const mockedApiClientFactory = createMockedApiClientFactory(mockedApiClient);

    vi.spyOn(mockedAppConfigRepo, "getChannelConfig").mockImplementationOnce(() =>
      ok(mockedAppChannelConfig),
    );

    const uc = new TransactionInitializeSessionUseCase({
      appConfigRepo: mockedAppConfigRepo,
      atobaraiApiClientFactory: mockedApiClientFactory,
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

    const mockedApiClient = createMockedApiClient();
    const mockedApiClientFactory = createMockedApiClientFactory(mockedApiClient);

    vi.spyOn(mockedAppConfigRepo, "getChannelConfig").mockImplementationOnce(() =>
      ok(mockedAppChannelConfig),
    );

    const uc = new TransactionInitializeSessionUseCase({
      appConfigRepo: mockedAppConfigRepo,
      atobaraiApiClientFactory: mockedApiClientFactory,
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

    const mockedApiClient = createMockedApiClient();
    const mockedApiClientFactory = createMockedApiClientFactory(mockedApiClient);

    const uc = new TransactionInitializeSessionUseCase({
      appConfigRepo: mockedAppConfigRepo,
      atobaraiApiClientFactory: mockedApiClientFactory,
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

    const mockedApiClient = createMockedApiClient();
    const mockedApiClientFactory = createMockedApiClientFactory(mockedApiClient);

    const uc = new TransactionInitializeSessionUseCase({
      appConfigRepo: mockedAppConfigRepo,
      atobaraiApiClientFactory: mockedApiClientFactory,
    });

    const responsePayload = await uc.execute({
      saleorApiUrl: mockedSaleorApiUrl,
      appId: mockedSaleorAppId,
      event: mockedTransactionInitializeSessionEvent,
    });

    expect(responsePayload._unsafeUnwrapErr()).toBeInstanceOf(AppIsNotConfiguredResponse);
  });

  it("should return ChargeFailureResult when Atobarai return multiple transaction results", async () => {
    const mockMultipleTransactions = createAtobaraiTransactionSuccessResponse({
      results: [
        {
          np_transaction_id: "np_123456",
          authori_result: "00",
        },
        {
          np_transaction_id: "np_789012",
          authori_result: "20",
          authori_ng: "RE001",
        },
        {
          np_transaction_id: "np_345678",
          authori_result: "20",
          authori_ng: "RE002",
        },
      ],
    });

    const mockedApiClient = createMockedApiClient();

    vi.mocked(mockedApiClient.registerTransaction).mockResolvedValue(ok(mockMultipleTransactions));

    const mockedApiClientFactory = createMockedApiClientFactory(mockedApiClient);

    vi.spyOn(mockedAppConfigRepo, "getChannelConfig").mockImplementationOnce(() =>
      ok(mockedAppChannelConfig),
    );

    const uc = new TransactionInitializeSessionUseCase({
      appConfigRepo: mockedAppConfigRepo,
      atobaraiApiClientFactory: mockedApiClientFactory,
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
});
