import { BaseError } from "@saleor/errors";
import { err, ok } from "neverthrow";
import { describe, expect, it, vi } from "vitest";

import { mockedAppChannelConfig } from "@/__tests__/mocks/app-config/mocked-app-config";
import { mockedAppConfigRepo } from "@/__tests__/mocks/app-config/mocked-app-config-repo";
import { MockedTransactionRecordRepo } from "@/__tests__/mocks/app-transaction/mocked-transaction-record-repo";
import { mockedAtobaraiApiClient } from "@/__tests__/mocks/atobarai/api/mocked-atobarai-api-client";
import { mockedAtobaraiTransactionId } from "@/__tests__/mocks/atobarai/mocked-atobarai-transaction-id";
import { mockedGraphqlClient } from "@/__tests__/mocks/graphql-client";
import { mockedSaleorApiUrl } from "@/__tests__/mocks/saleor/mocked-saleor-api-url";
import { mockedSaleorAppId } from "@/__tests__/mocks/saleor/mocked-saleor-app-id";
import { mockedFulfillmentTrackingNumberUpdatedEvent } from "@/__tests__/mocks/saleor-events/mocked-fulfillment-tracking-number-updated-event";
import { InvalidEventValidationError } from "@/app/api/webhooks/saleor/use-case-errors";
import { createAtobaraiFulfillmentReportSuccessResponse } from "@/modules/atobarai/api/atobarai-fulfillment-report-success-response";
import {
  AtobaraiApiClientFulfillmentReportError,
  IAtobaraiApiClientFactory,
} from "@/modules/atobarai/api/types";
import { IOrderNoteService } from "@/modules/saleor/order-note-service";
import { TransactionRecordRepoError } from "@/modules/transactions-recording/types";

import { AppIsNotConfiguredResponse, BrokenAppResponse } from "../saleor-webhook-responses";
import { FulfillmentTrackingNumberUpdatedUseCase } from "./use-case";
import { FulfillmentTrackingNumberUpdatedUseCaseResponse } from "./use-case-response";

describe("FulfillmentTrackingNumberUpdatedUseCase", () => {
  const atobaraiApiClientFactory = {
    create: () => mockedAtobaraiApiClient,
  } satisfies IAtobaraiApiClientFactory;

  const mockedOrderNoteService = {
    addOrderNote: vi.fn().mockResolvedValue(ok({ noteId: "note-123" })),
  } satisfies IOrderNoteService;

  it("should return Success response when fulfillment is reported successfully", async () => {
    const mockFulfillmentResponse = createAtobaraiFulfillmentReportSuccessResponse({
      results: [
        {
          np_transaction_id: mockedAtobaraiTransactionId,
        },
      ],
    });

    vi.spyOn(mockedAtobaraiApiClient, "reportFulfillment").mockResolvedValue(
      ok(mockFulfillmentResponse),
    );

    vi.spyOn(mockedAppConfigRepo, "getChannelConfig").mockResolvedValue(ok(mockedAppChannelConfig));

    const addOrderNoteSpy = vi
      .spyOn(mockedOrderNoteService, "addOrderNote")
      .mockResolvedValue(ok({ noteId: "note-123" }));

    const useCase = new FulfillmentTrackingNumberUpdatedUseCase({
      appConfigRepo: mockedAppConfigRepo,
      atobaraiApiClientFactory,
      transactionRecordRepo: new MockedTransactionRecordRepo(),
      orderNoteServiceFactory() {
        return mockedOrderNoteService;
      },
    });

    const result = await useCase.execute({
      appId: mockedSaleorAppId,
      saleorApiUrl: mockedSaleorApiUrl,
      event: mockedFulfillmentTrackingNumberUpdatedEvent,
      graphqlClient: mockedGraphqlClient,
    });

    expect(result._unsafeUnwrap()).toBeInstanceOf(
      FulfillmentTrackingNumberUpdatedUseCaseResponse.Success,
    );

    expect(addOrderNoteSpy).toHaveBeenCalledWith({
      orderId: mockedFulfillmentTrackingNumberUpdatedEvent.order.id,
      message: `Successfully reported fulfillment for tracking number ${mockedFulfillmentTrackingNumberUpdatedEvent.fulfillment.trackingNumber}`,
    });
  });

  it("should return Failure response when Atobarai API returns error", async () => {
    const apiError = new AtobaraiApiClientFulfillmentReportError("API error");

    vi.spyOn(mockedAtobaraiApiClient, "reportFulfillment").mockResolvedValue(err(apiError));

    vi.spyOn(mockedAppConfigRepo, "getChannelConfig").mockResolvedValue(ok(mockedAppChannelConfig));

    const addOrderNoteSpy = vi
      .spyOn(mockedOrderNoteService, "addOrderNote")
      .mockResolvedValue(ok({ noteId: "note-123" }));

    const useCase = new FulfillmentTrackingNumberUpdatedUseCase({
      appConfigRepo: mockedAppConfigRepo,
      atobaraiApiClientFactory,
      transactionRecordRepo: new MockedTransactionRecordRepo(),
      orderNoteServiceFactory() {
        return mockedOrderNoteService;
      },
    });

    const result = await useCase.execute({
      appId: mockedSaleorAppId,
      saleorApiUrl: mockedSaleorApiUrl,
      event: mockedFulfillmentTrackingNumberUpdatedEvent,
      graphqlClient: mockedGraphqlClient,
    });

    expect(result._unsafeUnwrap()).toBeInstanceOf(
      FulfillmentTrackingNumberUpdatedUseCaseResponse.Failure,
    );

    expect(addOrderNoteSpy).toHaveBeenCalledWith({
      orderId: mockedFulfillmentTrackingNumberUpdatedEvent.order.id,
      message: `Failed to report fulfillment for tracking number ${mockedFulfillmentTrackingNumberUpdatedEvent.fulfillment.trackingNumber}`,
    });
  });

  it("should return AppIsNotConfiguredResponse when app config is not found", async () => {
    vi.spyOn(mockedAppConfigRepo, "getChannelConfig").mockResolvedValue(ok(null));

    const useCase = new FulfillmentTrackingNumberUpdatedUseCase({
      appConfigRepo: mockedAppConfigRepo,
      atobaraiApiClientFactory,
      transactionRecordRepo: new MockedTransactionRecordRepo(),
      orderNoteServiceFactory() {
        return mockedOrderNoteService;
      },
    });

    const result = await useCase.execute({
      appId: mockedSaleorAppId,
      saleorApiUrl: mockedSaleorApiUrl,
      event: mockedFulfillmentTrackingNumberUpdatedEvent,
      graphqlClient: mockedGraphqlClient,
    });

    expect(result._unsafeUnwrapErr()).toBeInstanceOf(AppIsNotConfiguredResponse);
  });

  it("should return AppIsNotConfiguredResponse when getChannelConfig fails", async () => {
    const configError = new BaseError("Config repo error");

    vi.spyOn(mockedAppConfigRepo, "getChannelConfig").mockResolvedValue(err(configError));

    const useCase = new FulfillmentTrackingNumberUpdatedUseCase({
      appConfigRepo: mockedAppConfigRepo,
      atobaraiApiClientFactory,
      transactionRecordRepo: new MockedTransactionRecordRepo(),
      orderNoteServiceFactory() {
        return mockedOrderNoteService;
      },
    });

    const result = await useCase.execute({
      appId: mockedSaleorAppId,
      saleorApiUrl: mockedSaleorApiUrl,
      event: mockedFulfillmentTrackingNumberUpdatedEvent,
      graphqlClient: mockedGraphqlClient,
    });

    expect(result._unsafeUnwrapErr()).toBeInstanceOf(AppIsNotConfiguredResponse);
  });

  it("should return InvalidEventValidationError when fulfillment is missing", async () => {
    const useCase = new FulfillmentTrackingNumberUpdatedUseCase({
      appConfigRepo: mockedAppConfigRepo,
      atobaraiApiClientFactory,
      transactionRecordRepo: new MockedTransactionRecordRepo(),
      orderNoteServiceFactory() {
        return mockedOrderNoteService;
      },
    });
    const event = {
      ...mockedFulfillmentTrackingNumberUpdatedEvent,
      fulfillment: null,
    };

    const result = await useCase.execute({
      appId: mockedSaleorAppId,
      saleorApiUrl: mockedSaleorApiUrl,
      event,
      graphqlClient: mockedGraphqlClient,
    });

    // @ts-expect-error we expect Failure which has error
    expect(result._unsafeUnwrap().error.message).toMatchInlineSnapshot(`
      "Fulfillment tracking number is missing
      Failed to parse Saleor event"
    `);
    expect(result._unsafeUnwrap().statusCode).toBe(200);
    expect(await result._unsafeUnwrap().getResponse().json()).toMatchInlineSnapshot(`
      {
        "message": "Fulfillment tracking number is missing",
      }
    `);
  });

  it("should return InvalidEventValidationError when tracking number is missing", async () => {
    const useCase = new FulfillmentTrackingNumberUpdatedUseCase({
      appConfigRepo: mockedAppConfigRepo,
      atobaraiApiClientFactory,
      transactionRecordRepo: new MockedTransactionRecordRepo(),
      orderNoteServiceFactory() {
        return mockedOrderNoteService;
      },
    });

    const event = {
      ...mockedFulfillmentTrackingNumberUpdatedEvent,
      fulfillment: {
        trackingNumber: "",
      },
    };

    const result = await useCase.execute({
      appId: mockedSaleorAppId,
      saleorApiUrl: mockedSaleorApiUrl,
      event,
      graphqlClient: mockedGraphqlClient,
    });

    // @ts-expect-error - we expect Failure response
    expect(result._unsafeUnwrap().error).toBeInstanceOf(InvalidEventValidationError);
    expect(result._unsafeUnwrap().statusCode).toBe(200);
  });

  it("should return InvalidEventValidationError when order transactions are missing", async () => {
    const useCase = new FulfillmentTrackingNumberUpdatedUseCase({
      appConfigRepo: mockedAppConfigRepo,
      atobaraiApiClientFactory,
      transactionRecordRepo: new MockedTransactionRecordRepo(),
      orderNoteServiceFactory() {
        return mockedOrderNoteService;
      },
    });

    const event = {
      ...mockedFulfillmentTrackingNumberUpdatedEvent,
      order: {
        ...mockedFulfillmentTrackingNumberUpdatedEvent.order,
        transactions: [],
      },
    };

    const result = await useCase.execute({
      appId: mockedSaleorAppId,
      saleorApiUrl: mockedSaleorApiUrl,
      event,
      graphqlClient: mockedGraphqlClient,
    });

    // @ts-expect-error - we expect Failure response
    expect(result._unsafeUnwrap().error).toBeInstanceOf(InvalidEventValidationError);
    expect(result._unsafeUnwrap().statusCode).toBe(200);
  });

  it("should return InvalidEventValidationError when multiple transactions are found", async () => {
    const useCase = new FulfillmentTrackingNumberUpdatedUseCase({
      appConfigRepo: mockedAppConfigRepo,
      atobaraiApiClientFactory,
      transactionRecordRepo: new MockedTransactionRecordRepo(),
      orderNoteServiceFactory() {
        return mockedOrderNoteService;
      },
    });

    const event = {
      ...mockedFulfillmentTrackingNumberUpdatedEvent,
      order: {
        ...mockedFulfillmentTrackingNumberUpdatedEvent.order,
        transactions: [
          {
            pspReference: "psp-ref-123",
            createdBy: {
              __typename: "App" as const,
              id: mockedSaleorAppId,
            },
          },
          {
            pspReference: "psp-ref-456",
            createdBy: {
              __typename: "App" as const,
              id: mockedSaleorAppId,
            },
          },
        ],
      },
    };

    const result = await useCase.execute({
      appId: mockedSaleorAppId,
      saleorApiUrl: mockedSaleorApiUrl,
      event,
      graphqlClient: mockedGraphqlClient,
    });

    // @ts-expect-error - we expect Failure response
    expect(result._unsafeUnwrap().error).toBeInstanceOf(InvalidEventValidationError);
    expect(result._unsafeUnwrap().statusCode).toBe(200);
  });

  it("should return InvalidEventValidationError when transaction was not created by an app", async () => {
    const useCase = new FulfillmentTrackingNumberUpdatedUseCase({
      appConfigRepo: mockedAppConfigRepo,
      atobaraiApiClientFactory,
      transactionRecordRepo: new MockedTransactionRecordRepo(),
      orderNoteServiceFactory() {
        return mockedOrderNoteService;
      },
    });

    const event = {
      ...mockedFulfillmentTrackingNumberUpdatedEvent,
      order: {
        ...mockedFulfillmentTrackingNumberUpdatedEvent.order,
        transactions: [
          {
            pspReference: "psp-ref-123",
            createdBy: {
              __typename: "User" as const,
            },
          },
        ],
      },
    };

    const result = await useCase.execute({
      appId: mockedSaleorAppId,
      saleorApiUrl: mockedSaleorApiUrl,
      event,
      graphqlClient: mockedGraphqlClient,
    });

    // @ts-expect-error - we expect Failure response
    expect(result._unsafeUnwrap().error).toBeInstanceOf(InvalidEventValidationError);
    expect(result._unsafeUnwrap().statusCode).toBe(200);
  });

  it("should return InvalidEventValidationError when transaction was created by different app", async () => {
    const useCase = new FulfillmentTrackingNumberUpdatedUseCase({
      appConfigRepo: mockedAppConfigRepo,
      atobaraiApiClientFactory,
      transactionRecordRepo: new MockedTransactionRecordRepo(),
      orderNoteServiceFactory() {
        return mockedOrderNoteService;
      },
    });

    const event = {
      ...mockedFulfillmentTrackingNumberUpdatedEvent,
      order: {
        ...mockedFulfillmentTrackingNumberUpdatedEvent.order,
        transactions: [
          {
            pspReference: "psp-ref-123",
            createdBy: {
              __typename: "App" as const,
              id: "different-app-id",
            },
          },
        ],
      },
    };

    const result = await useCase.execute({
      appId: mockedSaleorAppId,
      saleorApiUrl: mockedSaleorApiUrl,
      event,
      graphqlClient: mockedGraphqlClient,
    });

    // @ts-expect-error - we expect Failure response
    expect(result._unsafeUnwrap().error).toBeInstanceOf(InvalidEventValidationError);
  });

  it("should return BrokenAppResponse when transactionRecordRepo fails to create transaction", async () => {
    const mockedTransactionRecordRepo = new MockedTransactionRecordRepo();

    vi.spyOn(mockedTransactionRecordRepo, "updateTransaction").mockImplementationOnce(async () =>
      err(
        new TransactionRecordRepoError.FailedUpdatingTransactionError(
          "Failed to update transaction",
        ),
      ),
    );

    vi.spyOn(mockedAtobaraiApiClient, "reportFulfillment").mockResolvedValue(
      ok(
        createAtobaraiFulfillmentReportSuccessResponse({
          results: [
            {
              np_transaction_id: mockedAtobaraiTransactionId,
            },
          ],
        }),
      ),
    );

    vi.spyOn(mockedAppConfigRepo, "getChannelConfig").mockResolvedValue(ok(mockedAppChannelConfig));
    vi.spyOn(mockedOrderNoteService, "addOrderNote").mockResolvedValue(ok({ noteId: "note-123" }));

    const useCase = new FulfillmentTrackingNumberUpdatedUseCase({
      appConfigRepo: mockedAppConfigRepo,
      atobaraiApiClientFactory,
      transactionRecordRepo: mockedTransactionRecordRepo,
      orderNoteServiceFactory() {
        return mockedOrderNoteService;
      },
    });

    const result = await useCase.execute({
      appId: mockedSaleorAppId,
      saleorApiUrl: mockedSaleorApiUrl,
      event: mockedFulfillmentTrackingNumberUpdatedEvent,
      graphqlClient: mockedGraphqlClient,
    });

    expect(result._unsafeUnwrapErr()).toBeInstanceOf(BrokenAppResponse);
  });

  it("should use private metadata for Atobarai PD company code if available", async () => {
    const atobaraiPDCompanyCode = "59020";

    const eventWithPDCompanyCode = {
      ...mockedFulfillmentTrackingNumberUpdatedEvent,
      fulfillment: {
        ...mockedFulfillmentTrackingNumberUpdatedEvent.fulfillment,
        atobaraiPDCompanyCode,
      },
    };

    const spy = vi.spyOn(mockedAtobaraiApiClient, "reportFulfillment").mockResolvedValue(
      ok(
        createAtobaraiFulfillmentReportSuccessResponse({
          results: [
            {
              np_transaction_id: mockedAtobaraiTransactionId,
            },
          ],
        }),
      ),
    );

    vi.spyOn(mockedAppConfigRepo, "getChannelConfig").mockResolvedValue(ok(mockedAppChannelConfig));
    vi.spyOn(mockedOrderNoteService, "addOrderNote").mockResolvedValue(ok({ noteId: "note-123" }));

    const useCase = new FulfillmentTrackingNumberUpdatedUseCase({
      appConfigRepo: mockedAppConfigRepo,
      atobaraiApiClientFactory,
      transactionRecordRepo: new MockedTransactionRecordRepo(),
      orderNoteServiceFactory() {
        return mockedOrderNoteService;
      },
    });

    const result = await useCase.execute({
      appId: mockedSaleorAppId,
      saleorApiUrl: mockedSaleorApiUrl,
      event: eventWithPDCompanyCode,
      graphqlClient: mockedGraphqlClient,
    });

    expect(result._unsafeUnwrap()).toBeInstanceOf(
      FulfillmentTrackingNumberUpdatedUseCaseResponse.Success,
    );

    expect(spy).toHaveBeenCalledWith(
      {
        transactions: [
          expect.objectContaining({
            pd_company_code: atobaraiPDCompanyCode,
          }),
        ],
      },
      {
        rejectMultipleResults: true,
      },
    );
  });

  it("should return InvalidEventValidationError when private metadata contains invalid shipping company code", async () => {
    const invalidPDCompanyCode = "INVALID_CODE";

    const eventWithInvalidPDCompanyCode = {
      ...mockedFulfillmentTrackingNumberUpdatedEvent,
      fulfillment: {
        ...mockedFulfillmentTrackingNumberUpdatedEvent.fulfillment,
        atobaraiPDCompanyCode: invalidPDCompanyCode,
      },
    };

    vi.spyOn(mockedAppConfigRepo, "getChannelConfig").mockResolvedValue(ok(mockedAppChannelConfig));

    const useCase = new FulfillmentTrackingNumberUpdatedUseCase({
      appConfigRepo: mockedAppConfigRepo,
      atobaraiApiClientFactory,
      transactionRecordRepo: new MockedTransactionRecordRepo(),
      orderNoteServiceFactory() {
        return mockedOrderNoteService;
      },
    });

    const result = await useCase.execute({
      appId: mockedSaleorAppId,
      saleorApiUrl: mockedSaleorApiUrl,
      event: eventWithInvalidPDCompanyCode,
      graphqlClient: mockedGraphqlClient,
    });

    // @ts-expect-error - we expect Failure response
    expect(result._unsafeUnwrap().error).toBeInstanceOf(InvalidEventValidationError);
    // @ts-expect-error - we expect Failure response
    expect(result._unsafeUnwrap().error.message).toContain(
      "Invalid shipping company code: Validation error: Invalid enum value. Expected '50000' | '59010' | '59020' | '59030' | '59040' | '59041' | '59042' | '59043' | '59050' | '59060' | '59080' | '59090' | '59110' | '59140' | '59150' | '59100' | '59160' | '55555', received 'INVALID_CODE'",
    );
    expect(result._unsafeUnwrap().statusCode).toBe(200);
    expect(await result._unsafeUnwrap().getResponse().json()).toMatchInlineSnapshot(`
      {
        "message": "[
        {
          "received": "INVALID_CODE",
          "code": "invalid_enum_value",
          "options": [
            "50000",
            "59010",
            "59020",
            "59030",
            "59040",
            "59041",
            "59042",
            "59043",
            "59050",
            "59060",
            "59080",
            "59090",
            "59110",
            "59140",
            "59150",
            "59100",
            "59160",
            "55555"
          ],
          "path": [],
          "message": "Invalid enum value. Expected '50000' | '59010' | '59020' | '59030' | '59040' | '59041' | '59042' | '59043' | '59050' | '59060' | '59080' | '59090' | '59110' | '59140' | '59150' | '59100' | '59160' | '55555', received 'INVALID_CODE'"
        }
      ]
      ZodValidationError: Validation error: Invalid enum value. Expected '50000' | '59010' | '59020' | '59030' | '59040' | '59041' | '59042' | '59043' | '59050' | '59060' | '59080' | '59090' | '59110' | '59140' | '59150' | '59100' | '59160' | '55555', received 'INVALID_CODE'
      Invalid shipping company code: Validation error: Invalid enum value. Expected '50000' | '59010' | '59020' | '59030' | '59040' | '59041' | '59042' | '59043' | '59050' | '59060' | '59080' | '59090' | '59110' | '59140' | '59150' | '59100' | '59160' | '55555', received 'INVALID_CODE'",
      }
    `);
  });
});
