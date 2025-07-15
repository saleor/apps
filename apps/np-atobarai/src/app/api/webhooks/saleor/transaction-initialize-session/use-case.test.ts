import { BaseError } from "@saleor/errors";
import { err, ok } from "neverthrow";
import { describe, expect, it, vi } from "vitest";

import { mockedAppChannelConfig } from "@/__tests__/mocks/app-config/mocked-app-config";
import { mockedAppConfigRepo } from "@/__tests__/mocks/app-config/mocked-app-config-repo";
import { mockedSaleorApiUrl } from "@/__tests__/mocks/saleor/mocked-saleor-api-url";
import { mockedSaleorAppId } from "@/__tests__/mocks/saleor/mocked-saleor-app-id";
import { mockedTransactionInitializeSessionEvent } from "@/__tests__/mocks/saleor-events/mocked-transaction-initialize-session-event";
import {
  BeforeReviewTransaction,
  FailedAtobaraiTransaction,
  PassedAtobaraiTransaction,
  PendingAtobaraiTransaction,
} from "@/modules/atobarai/atobarai-transaction";
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
  });

  const createMockedApiClientFactory = (
    apiClient: IAtobaraiApiClient,
  ): IAtobaraiApiClientFactory => ({
    create: vi.fn().mockReturnValue(apiClient),
  });

  it("Returns Success response with ChargeSuccessResult when Atobarai returns PassedAtobaraiTransaction", async () => {
    const mockPassedTransaction = PassedAtobaraiTransaction.createFromAtobaraiTransactionResponse({
      np_transaction_id: "test-transaction-id",
      authori_result: "00",
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

  it("Returns Success response with ChargeActionRequiredResult when Atobarai returns PendingAtobaraiTransaction", async () => {
    const mockPendingTransaction = PendingAtobaraiTransaction.createFromAtobaraiTransactionResponse(
      {
        np_transaction_id: "test-pending-transaction-id",
        authori_result: "10",
        authori_hold: ["RE009"],
      },
    );

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

  it("Returns Failure response with ChargeFailureResult when Atobarai returns FailedAtobaraiTransaction", async () => {
    const mockFailedTransaction = FailedAtobaraiTransaction.createFromAtobaraiTransactionResponse({
      np_transaction_id: "test-failed-transaction-id",
      authori_result: "20",
      authori_ng: "NG001",
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

  it("Returns Failure response with ChargeFailureResult when Atobarai returns BeforeReviewTransaction", async () => {
    const mockBeforeReviewTransaction =
      BeforeReviewTransaction.createFromAtobaraiTransactionResponse({
        np_transaction_id: "test-before-review-transaction-id",
        authori_result: "40",
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

  it("Returns Failure response when Atobarai API returns an error", async () => {
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

  it("Returns MalformedRequestResponse when event is missing issuedAt", async () => {
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

  it("Returns AppIsNotConfiguredResponse if config not found for specified channel", async () => {
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

  it("Returns AppIsNotConfiguredResponse if there is an error fetching config", async () => {
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
});
