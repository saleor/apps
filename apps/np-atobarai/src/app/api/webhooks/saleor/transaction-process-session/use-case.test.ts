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
import { InvalidEventValidationError } from "@/app/api/webhooks/saleor/use-case-errors";
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

import { AppIsNotConfiguredResponse } from "../saleor-webhook-responses";
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

    const response = responsePayload._unsafeUnwrap();

    expect(response).toBeInstanceOf(TransactionProcessSessionUseCaseResponse.Failure);
    expect(response.transactionResult).toBeInstanceOf(ChargeFailureResult);

    // eslint-disable-next-line
    const responseJson = (await response.getResponse().json()) as any;

    expect(responseJson.data.errors[0].code).toBe("AtobaraiFailureTransactionError");
    expect(responseJson.data.errors[0].message).toBe("Atobarai returned failed transaction");
    /*
     * Note: apiError is undefined here because this is a business logic error, not an API error
     * The API call succeeded but returned a failed transaction status
     * @ts-expect-error testing arbitrary json
     */
    expect(responseJson.data.errors[0].apiError).toBeUndefined();
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

    const response = responsePayload._unsafeUnwrap();

    expect(response).toBeInstanceOf(TransactionProcessSessionUseCaseResponse.Failure);
    expect(response.transactionResult).toBeInstanceOf(ChargeFailureResult);

    // eslint-disable-next-line
    const responseJson = (await response.getResponse().json()) as any;

    expect(responseJson.data.errors[0].code).toBe("AtobaraiFailureTransactionError");
    expect(responseJson.data.errors[0].message).toBe("Atobarai returned failed transaction");
    /*
     * Note: apiError is undefined here because this is a business logic error, not an API error
     * @ts-expect-error testing arbitrary json
     */
    expect(responseJson.data.errors[0].apiError).toBeUndefined();
  });

  it("should return Failure response when Atobarai API returns an error", async () => {
    const mockApiError = new AtobaraiApiClientChangeTransactionError("API Error", {
      props: {
        apiError: "test-api-error-code",
      },
    });

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

    const response = responsePayload._unsafeUnwrap();

    expect(response).toBeInstanceOf(TransactionProcessSessionUseCaseResponse.Failure);

    const responseJson = await response.getResponse().json();

    // @ts-expect-error testing arbitrary json
    expect(responseJson.data.errors[0].apiError).toBe("test-api-error-code");
  });

  it("should return InvalidEventValidationError when event is missing issuedAt", async () => {
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

    // @ts-expect-error - we expect Failure response
    expect(responsePayload._unsafeUnwrap().error).toBeInstanceOf(InvalidEventValidationError);
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

  describe("Integration - Full HTTP Flow", () => {
    it("should propagate apiError from HTTP 400 response through to final response", async () => {
      // Mock fetch to return Atobarai API error
      const fetchSpy = vi.spyOn(globalThis, "fetch");

      fetchSpy.mockResolvedValue(
        Response.json(
          {
            errors: [
              {
                codes: ["TRANSACTION_NOT_FOUND", "ANOTHER_ERROR"],
                id: "error-12345",
              },
            ],
          },
          { status: 400 },
        ),
      );

      vi.spyOn(mockedAppConfigRepo, "getChannelConfig").mockImplementationOnce(() =>
        ok(mockedAppChannelConfig),
      );

      // Use real API client factory (not mocked)
      const { AtobaraiApiClientFactory } = await import(
        "@/modules/atobarai/api/atobarai-api-client-factory"
      );
      const realApiClientFactory = new AtobaraiApiClientFactory();

      const uc = new TransactionProcessSessionUseCase({
        appConfigRepo: mockedAppConfigRepo,
        atobaraiApiClientFactory: realApiClientFactory,
      });

      const responsePayload = await uc.execute({
        saleorApiUrl: mockedSaleorApiUrl,
        appId: mockedSaleorAppId,
        event: mockedTransactionProcessSessionEvent,
      });

      const response = responsePayload._unsafeUnwrap();

      expect(response).toBeInstanceOf(TransactionProcessSessionUseCaseResponse.Failure);

      // eslint-disable-next-line
      const responseJson = (await response.getResponse().json()) as any;

      /*
       * Verify API error code propagates end-to-end
       * @ts-expect-error testing arbitrary json
       */
      expect(responseJson.data.errors[0].apiError).toBe("TRANSACTION_NOT_FOUND");
      expect(responseJson.data.errors[0].code).toBe("AtobaraiChangeTransactionError");
    });

    it("should handle network errors in full HTTP flow", async () => {
      const fetchSpy = vi.spyOn(globalThis, "fetch");

      fetchSpy.mockRejectedValue(new Error("Network connection failed"));

      vi.spyOn(mockedAppConfigRepo, "getChannelConfig").mockImplementationOnce(() =>
        ok(mockedAppChannelConfig),
      );

      const { AtobaraiApiClientFactory } = await import(
        "@/modules/atobarai/api/atobarai-api-client-factory"
      );
      const realApiClientFactory = new AtobaraiApiClientFactory();

      const uc = new TransactionProcessSessionUseCase({
        appConfigRepo: mockedAppConfigRepo,
        atobaraiApiClientFactory: realApiClientFactory,
      });

      const responsePayload = await uc.execute({
        saleorApiUrl: mockedSaleorApiUrl,
        appId: mockedSaleorAppId,
        event: mockedTransactionProcessSessionEvent,
      });

      const response = responsePayload._unsafeUnwrap();

      expect(response).toBeInstanceOf(TransactionProcessSessionUseCaseResponse.Failure);

      // eslint-disable-next-line
      const responseJson = (await response.getResponse().json()) as any;

      /*
       * Network errors don't have apiError
       * @ts-expect-error testing arbitrary json
       */
      expect(responseJson.data.errors[0].apiError).toBeUndefined();
      expect(responseJson.data.errors[0].code).toBe("AtobaraiChangeTransactionError");
    });
  });
});
