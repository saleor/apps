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
import { InvalidEventValidationError } from "@/app/api/webhooks/saleor/use-case-errors";
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

import { AppIsNotConfiguredResponse, BrokenAppResponse } from "../saleor-webhook-responses";
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
    const mockApiError = new AtobaraiApiClientRegisterTransactionError("API Error", {
      props: {
        apiError: "test-api-error",
      },
    });

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

    const response = responsePayload._unsafeUnwrap();

    expect(response).toBeInstanceOf(TransactionInitializeSessionUseCaseResponse.Failure);

    const responseJson = await response.getResponse().json();

    //@ts-expect-error - testing arbitrary json, not typed
    expect(responseJson.data.errors[0].apiError).toBe("test-api-error");
  });

  it("should return InvalidEventValidationError when event is missing issuedAt", async () => {
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

    // @ts-expect-error - we expect Failure response
    expect(responsePayload._unsafeUnwrap().error).toBeInstanceOf(InvalidEventValidationError);
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

  it("should return Failure response with InvalidEventValidationError when billing address is empty", async () => {
    const eventWithMissingBillingAddress = {
      ...mockedTransactionInitializeSessionEvent,
      sourceObject: {
        ...mockedTransactionInitializeSessionEvent.sourceObject,
        billingAddress: null,
      },
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
      event: eventWithMissingBillingAddress,
    });

    const response = responsePayload._unsafeUnwrap();

    expect(response).toBeInstanceOf(TransactionInitializeSessionUseCaseResponse.Failure);
    expect(response.transactionResult).toBeInstanceOf(ChargeFailureResult);

    if (response instanceof TransactionInitializeSessionUseCaseResponse.Failure) {
      expect(response.error).toBeInstanceOf(InvalidEventValidationError);
      expect(response.error.message).toMatchInlineSnapshot(
        `
        "AtobaraiRegisterTransactionPayloadValidationError: AtobaraiCustomerMissingDataError: Billing address is required to create AtobaraiCustomer
        AtobaraiCustomerMissingDataError: Billing address is required to create AtobaraiCustomer"
      `,
      );
    }

    expect(await response.getResponse().json()).toStrictEqual({
      actions: [],
      data: {
        errors: [
          {
            code: "InvalidEventValidationError",
            message:
              "AtobaraiCustomerMissingDataError: Billing address is required to create AtobaraiCustomer",
          },
        ],
      },
      message: "Failed to register NP Atobarai transaction",
      result: "CHARGE_FAILURE",
    });
  });

  it("should return Failure response with InvalidEventValidationError when phone is missing", async () => {
    const eventWithMissingPhone = {
      ...mockedTransactionInitializeSessionEvent,
      sourceObject: {
        ...mockedTransactionInitializeSessionEvent.sourceObject,
        billingAddress: {
          ...mockedTransactionInitializeSessionEvent.sourceObject.billingAddress,
          phone: null,
        },
      },
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
      event: eventWithMissingPhone,
    });

    const response = responsePayload._unsafeUnwrap();

    expect(response).toBeInstanceOf(TransactionInitializeSessionUseCaseResponse.Failure);

    if (response instanceof TransactionInitializeSessionUseCaseResponse.Failure) {
      expect(response.error).toBeInstanceOf(InvalidEventValidationError);
      expect(response.error.message).toMatchInlineSnapshot(
        `
        "AtobaraiRegisterTransactionPayloadValidationError: AtobaraiCustomerMissingDataError: Phone number is required to create AtobaraiCustomer
        AtobaraiCustomerMissingDataError: Phone number is required to create AtobaraiCustomer"
      `,
      );
      expect(await response.getResponse().json()).toStrictEqual({
        actions: [],
        data: {
          errors: [
            {
              code: "InvalidEventValidationError",
              message:
                "AtobaraiCustomerMissingDataError: Phone number is required to create AtobaraiCustomer",
            },
          ],
        },
        message: "Failed to register NP Atobarai transaction",
        result: "CHARGE_FAILURE",
      });
    }
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
                codes: ["INVALID_MERCHANT_CODE", "ANOTHER_ERROR"],
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

      const uc = new TransactionInitializeSessionUseCase({
        appConfigRepo: mockedAppConfigRepo,
        atobaraiApiClientFactory: realApiClientFactory,
        appTransactionRepo: new MockedTransactionRecordRepo(),
      });

      const responsePayload = await uc.execute({
        saleorApiUrl: mockedSaleorApiUrl,
        appId: mockedSaleorAppId,
        event: mockedTransactionInitializeSessionEvent,
      });

      const response = responsePayload._unsafeUnwrap();

      expect(response).toBeInstanceOf(TransactionInitializeSessionUseCaseResponse.Failure);
      // eslint-disable-next-line
      const responseJson = (await response.getResponse().json()) as any;

      /*
       * Verify API error code propagates end-to-end
       * @ts-expect-error testing arbitrary json
       */
      expect(responseJson.data.errors[0].apiError).toBe("INVALID_MERCHANT_CODE");
      expect(responseJson.data.errors[0].code).toBe("AtobaraiRegisterTransactionError");
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

      const uc = new TransactionInitializeSessionUseCase({
        appConfigRepo: mockedAppConfigRepo,
        atobaraiApiClientFactory: realApiClientFactory,
        appTransactionRepo: new MockedTransactionRecordRepo(),
      });

      const responsePayload = await uc.execute({
        saleorApiUrl: mockedSaleorApiUrl,
        appId: mockedSaleorAppId,
        event: mockedTransactionInitializeSessionEvent,
      });

      const response = responsePayload._unsafeUnwrap();

      expect(response).toBeInstanceOf(TransactionInitializeSessionUseCaseResponse.Failure);

      // eslint-disable-next-line
      const responseJson = (await response.getResponse().json()) as any;

      expect(responseJson.data.errors[0].apiError).toBeUndefined();
      expect(responseJson.data.errors[0].code).toBe("AtobaraiRegisterTransactionError");
    });
  });
});
