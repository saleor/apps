import { BaseError } from "@saleor/errors";
import { err, ok } from "neverthrow";
import { describe, expect, it, vi } from "vitest";

import { mockedAppChannelConfig } from "@/__tests__/mocks/app-config/mocked-app-config";
import { mockedAppConfigRepo } from "@/__tests__/mocks/app-config/mocked-app-config-repo";
import { mockedAtobaraiApiClient } from "@/__tests__/mocks/atobarai/api/mocked-atobarai-api-client";
import { mockedAtobaraiTransactionId } from "@/__tests__/mocks/atobarai/mocked-atobarai-transaction-id";
import { mockedSaleorApiUrl } from "@/__tests__/mocks/saleor/mocked-saleor-api-url";
import { mockedSaleorAppId } from "@/__tests__/mocks/saleor/mocked-saleor-app-id";
import { mockedTransactionProcessSessionEvent } from "@/__tests__/mocks/saleor-events/mocked-transaction-process-session-event";
import {
  createAtobaraiTransactionSuccessResponse,
  CreditCheckResult,
  FailedReason,
  PendingReason,
} from "@/modules/atobarai/api/atobarai-transaction-success-response";
import {
  AtobaraiApiClientChangeTransactionError,
  IAtobaraiApiClientFactory,
} from "@/modules/atobarai/api/types";
import {
  ChargeActionRequiredResult,
  ChargeFailureResult,
  ChargeSuccessResult,
} from "@/modules/transaction-result/charge-result";

import { AppIsNotConfiguredResponse, MalformedRequestResponse } from "../saleor-webhook-responses";
import { TransactionProcessSessionUseCase } from "./use-case";
import { TransactionProcessSessionUseCaseResponse } from "./use-case-response";

describe("TransactionProcessSessionUseCase", () => {
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

    vi.spyOn(mockedAtobaraiApiClient, "changeTransaction").mockResolvedValue(
      ok(mockPassedTransaction),
    );

    vi.spyOn(mockedAppConfigRepo, "getChannelConfig").mockImplementationOnce(() =>
      ok(mockedAppChannelConfig),
    );

    const uc = new TransactionProcessSessionUseCase({
      appConfigRepo: mockedAppConfigRepo,
      atobaraiApiClientFactory,
    });

    const responsePayload = await uc.execute({
      saleorApiUrl: mockedSaleorApiUrl,
      appId: mockedSaleorAppId,
      event: mockedTransactionProcessSessionEvent,
    });

    expect(responsePayload._unsafeUnwrap()).toBeInstanceOf(
      TransactionProcessSessionUseCaseResponse.Success,
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

    vi.spyOn(mockedAtobaraiApiClient, "changeTransaction").mockResolvedValue(
      ok(mockPendingTransaction),
    );

    vi.spyOn(mockedAppConfigRepo, "getChannelConfig").mockImplementationOnce(() =>
      ok(mockedAppChannelConfig),
    );

    const uc = new TransactionProcessSessionUseCase({
      appConfigRepo: mockedAppConfigRepo,
      atobaraiApiClientFactory,
    });

    const responsePayload = await uc.execute({
      saleorApiUrl: mockedSaleorApiUrl,
      appId: mockedSaleorAppId,
      event: mockedTransactionProcessSessionEvent,
    });

    expect(responsePayload._unsafeUnwrap()).toBeInstanceOf(
      TransactionProcessSessionUseCaseResponse.Success,
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

    vi.spyOn(mockedAtobaraiApiClient, "changeTransaction").mockResolvedValue(
      ok(mockFailedTransaction),
    );

    vi.spyOn(mockedAppConfigRepo, "getChannelConfig").mockImplementationOnce(() =>
      ok(mockedAppChannelConfig),
    );

    const uc = new TransactionProcessSessionUseCase({
      appConfigRepo: mockedAppConfigRepo,
      atobaraiApiClientFactory,
    });

    const responsePayload = await uc.execute({
      saleorApiUrl: mockedSaleorApiUrl,
      appId: mockedSaleorAppId,
      event: mockedTransactionProcessSessionEvent,
    });

    expect(responsePayload._unsafeUnwrap()).toBeInstanceOf(
      TransactionProcessSessionUseCaseResponse.Failure,
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

    vi.spyOn(mockedAtobaraiApiClient, "changeTransaction").mockResolvedValue(
      ok(mockBeforeReviewTransaction),
    );

    vi.spyOn(mockedAppConfigRepo, "getChannelConfig").mockImplementationOnce(() =>
      ok(mockedAppChannelConfig),
    );

    const uc = new TransactionProcessSessionUseCase({
      appConfigRepo: mockedAppConfigRepo,
      atobaraiApiClientFactory,
    });

    const responsePayload = await uc.execute({
      saleorApiUrl: mockedSaleorApiUrl,
      appId: mockedSaleorAppId,
      event: mockedTransactionProcessSessionEvent,
    });

    expect(responsePayload._unsafeUnwrap()).toBeInstanceOf(
      TransactionProcessSessionUseCaseResponse.Failure,
    );

    expect(responsePayload._unsafeUnwrap().transactionResult).toBeInstanceOf(ChargeFailureResult);
  });

  it("should return Failure response when Atobarai API returns an error", async () => {
    const mockApiError = new AtobaraiApiClientChangeTransactionError("API Error");

    vi.spyOn(mockedAtobaraiApiClient, "changeTransaction").mockResolvedValue(err(mockApiError));

    vi.spyOn(mockedAppConfigRepo, "getChannelConfig").mockImplementationOnce(() =>
      ok(mockedAppChannelConfig),
    );

    const uc = new TransactionProcessSessionUseCase({
      appConfigRepo: mockedAppConfigRepo,
      atobaraiApiClientFactory,
    });

    const responsePayload = await uc.execute({
      saleorApiUrl: mockedSaleorApiUrl,
      appId: mockedSaleorAppId,
      event: mockedTransactionProcessSessionEvent,
    });

    expect(responsePayload._unsafeUnwrap()).toBeInstanceOf(
      TransactionProcessSessionUseCaseResponse.Failure,
    );
  });

  it("should return MalformedRequestResponse when event is missing issuedAt", async () => {
    const eventWithoutIssuedAt = {
      ...mockedTransactionProcessSessionEvent,
      issuedAt: null,
    };

    vi.spyOn(mockedAppConfigRepo, "getChannelConfig").mockImplementationOnce(() =>
      ok(mockedAppChannelConfig),
    );

    const uc = new TransactionProcessSessionUseCase({
      appConfigRepo: mockedAppConfigRepo,
      atobaraiApiClientFactory,
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

    const uc = new TransactionProcessSessionUseCase({
      appConfigRepo: mockedAppConfigRepo,
      atobaraiApiClientFactory,
    });

    const responsePayload = await uc.execute({
      saleorApiUrl: mockedSaleorApiUrl,
      appId: mockedSaleorAppId,
      event: mockedTransactionProcessSessionEvent,
    });

    expect(responsePayload._unsafeUnwrapErr()).toBeInstanceOf(AppIsNotConfiguredResponse);
  });

  it("should return AppIsNotConfiguredResponse if there is an error fetching config", async () => {
    const configError = new BaseError("Failed to fetch config");

    vi.spyOn(mockedAppConfigRepo, "getChannelConfig").mockImplementationOnce(() =>
      err(configError),
    );

    const uc = new TransactionProcessSessionUseCase({
      appConfigRepo: mockedAppConfigRepo,
      atobaraiApiClientFactory,
    });

    const responsePayload = await uc.execute({
      saleorApiUrl: mockedSaleorApiUrl,
      appId: mockedSaleorAppId,
      event: mockedTransactionProcessSessionEvent,
    });

    expect(responsePayload._unsafeUnwrapErr()).toBeInstanceOf(AppIsNotConfiguredResponse);
  });
});
