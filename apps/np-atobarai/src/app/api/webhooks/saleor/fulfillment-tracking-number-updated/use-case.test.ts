import { BaseError } from "@saleor/errors";
import { err, ok } from "neverthrow";
import { describe, expect, it, vi } from "vitest";

import { mockedAppChannelConfig } from "@/__tests__/mocks/app-config/mocked-app-config";
import { mockedAppConfigRepo } from "@/__tests__/mocks/app-config/mocked-app-config-repo";
import { mockedAtobaraiApiClient } from "@/__tests__/mocks/atobarai/api/mocked-atobarai-api-client";
import { mockedAtobaraiTransactionId } from "@/__tests__/mocks/atobarai/mocked-atobarai-transaction-id";
import { mockedSaleorApiUrl } from "@/__tests__/mocks/saleor/mocked-saleor-api-url";
import { mockedSaleorAppId } from "@/__tests__/mocks/saleor/mocked-saleor-app-id";
import { mockedFulfillmentTrackingNumberUpdatedEvent } from "@/__tests__/mocks/saleor-events/mocked-fulfillment-tracking-number-updated-event";
import { createAtobaraiFulfillmentReportSuccessResponse } from "@/modules/atobarai/api/atobarai-fulfillment-report-success-response";
import {
  AtobaraiApiClientFulfillmentReportError,
  IAtobaraiApiClientFactory,
} from "@/modules/atobarai/api/types";

import { AppIsNotConfiguredResponse, MalformedRequestResponse } from "../saleor-webhook-responses";
import { FulfillmentTrackingNumberUpdatedUseCase } from "./use-case";
import { FulfillmentTrackingNumberUpdatedUseCaseResponse } from "./use-case-response";

describe("FulfillmentTrackingNumberUpdatedUseCase", () => {
  const atobaraiApiClientFactory = {
    create: () => mockedAtobaraiApiClient,
  } satisfies IAtobaraiApiClientFactory;

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

    const useCase = new FulfillmentTrackingNumberUpdatedUseCase({
      appConfigRepo: mockedAppConfigRepo,
      atobaraiApiClientFactory,
    });

    const result = await useCase.execute({
      appId: mockedSaleorAppId,
      saleorApiUrl: mockedSaleorApiUrl,
      event: mockedFulfillmentTrackingNumberUpdatedEvent,
    });

    expect(result._unsafeUnwrap()).toBeInstanceOf(
      FulfillmentTrackingNumberUpdatedUseCaseResponse.Success,
    );
  });

  it("should return Failure response when Atobarai API returns error", async () => {
    const apiError = new AtobaraiApiClientFulfillmentReportError("API error");

    vi.spyOn(mockedAtobaraiApiClient, "reportFulfillment").mockResolvedValue(err(apiError));

    vi.spyOn(mockedAppConfigRepo, "getChannelConfig").mockResolvedValue(ok(mockedAppChannelConfig));

    const useCase = new FulfillmentTrackingNumberUpdatedUseCase({
      appConfigRepo: mockedAppConfigRepo,
      atobaraiApiClientFactory,
    });

    const result = await useCase.execute({
      appId: mockedSaleorAppId,
      saleorApiUrl: mockedSaleorApiUrl,
      event: mockedFulfillmentTrackingNumberUpdatedEvent,
    });

    expect(result._unsafeUnwrap()).toBeInstanceOf(
      FulfillmentTrackingNumberUpdatedUseCaseResponse.Failure,
    );
  });

  it("should return Failure response when multiple transaction results are returned", async () => {
    const mockFulfillmentResponse = createAtobaraiFulfillmentReportSuccessResponse({
      results: [
        { np_transaction_id: mockedAtobaraiTransactionId },
        { np_transaction_id: "np-trans-42" },
      ],
    });

    vi.spyOn(mockedAtobaraiApiClient, "reportFulfillment").mockResolvedValue(
      ok(mockFulfillmentResponse),
    );

    vi.spyOn(mockedAppConfigRepo, "getChannelConfig").mockResolvedValue(ok(mockedAppChannelConfig));

    const useCase = new FulfillmentTrackingNumberUpdatedUseCase({
      appConfigRepo: mockedAppConfigRepo,
      atobaraiApiClientFactory,
    });

    const result = await useCase.execute({
      appId: mockedSaleorAppId,
      saleorApiUrl: mockedSaleorApiUrl,
      event: mockedFulfillmentTrackingNumberUpdatedEvent,
    });

    expect(result._unsafeUnwrap()).toBeInstanceOf(
      FulfillmentTrackingNumberUpdatedUseCaseResponse.Failure,
    );
  });

  it("should return AppIsNotConfiguredResponse when app config is not found", async () => {
    vi.spyOn(mockedAppConfigRepo, "getChannelConfig").mockResolvedValue(ok(null));

    const useCase = new FulfillmentTrackingNumberUpdatedUseCase({
      appConfigRepo: mockedAppConfigRepo,
      atobaraiApiClientFactory,
    });

    const result = await useCase.execute({
      appId: mockedSaleorAppId,
      saleorApiUrl: mockedSaleorApiUrl,
      event: mockedFulfillmentTrackingNumberUpdatedEvent,
    });

    expect(result._unsafeUnwrapErr()).toBeInstanceOf(AppIsNotConfiguredResponse);
  });

  it("should return AppIsNotConfiguredResponse when getChannelConfig fails", async () => {
    const configError = new BaseError("Config repo error");

    vi.spyOn(mockedAppConfigRepo, "getChannelConfig").mockResolvedValue(err(configError));

    const useCase = new FulfillmentTrackingNumberUpdatedUseCase({
      appConfigRepo: mockedAppConfigRepo,
      atobaraiApiClientFactory,
    });

    const result = await useCase.execute({
      appId: mockedSaleorAppId,
      saleorApiUrl: mockedSaleorApiUrl,
      event: mockedFulfillmentTrackingNumberUpdatedEvent,
    });

    expect(result._unsafeUnwrapErr()).toBeInstanceOf(AppIsNotConfiguredResponse);
  });

  it("should return MalformedRequestResponse when fulfillment is missing", async () => {
    const useCase = new FulfillmentTrackingNumberUpdatedUseCase({
      appConfigRepo: mockedAppConfigRepo,
      atobaraiApiClientFactory,
    });
    const event = {
      ...mockedFulfillmentTrackingNumberUpdatedEvent,
      fulfillment: null,
    };

    const result = await useCase.execute({
      appId: mockedSaleorAppId,
      saleorApiUrl: mockedSaleorApiUrl,
      event,
    });

    expect(result._unsafeUnwrapErr()).toBeInstanceOf(MalformedRequestResponse);
  });

  it("should return MalformedRequestResponse when tracking number is missing", async () => {
    const useCase = new FulfillmentTrackingNumberUpdatedUseCase({
      appConfigRepo: mockedAppConfigRepo,
      atobaraiApiClientFactory,
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
    });

    expect(result._unsafeUnwrapErr()).toBeInstanceOf(MalformedRequestResponse);
  });

  it("should return MalformedRequestResponse when order transactions are missing", async () => {
    const useCase = new FulfillmentTrackingNumberUpdatedUseCase({
      appConfigRepo: mockedAppConfigRepo,
      atobaraiApiClientFactory,
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
    });

    expect(result._unsafeUnwrapErr()).toBeInstanceOf(MalformedRequestResponse);
  });

  it("should return MalformedRequestResponse when multiple transactions are found", async () => {
    const useCase = new FulfillmentTrackingNumberUpdatedUseCase({
      appConfigRepo: mockedAppConfigRepo,
      atobaraiApiClientFactory,
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
    });

    expect(result._unsafeUnwrapErr()).toBeInstanceOf(MalformedRequestResponse);
  });

  it("should return MalformedRequestResponse when transaction was not created by an app", async () => {
    const useCase = new FulfillmentTrackingNumberUpdatedUseCase({
      appConfigRepo: mockedAppConfigRepo,
      atobaraiApiClientFactory,
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
    });

    expect(result._unsafeUnwrapErr()).toBeInstanceOf(MalformedRequestResponse);
  });

  it("should return MalformedRequestResponse when transaction was created by different app", async () => {
    const useCase = new FulfillmentTrackingNumberUpdatedUseCase({
      appConfigRepo: mockedAppConfigRepo,
      atobaraiApiClientFactory,
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
    });

    expect(result._unsafeUnwrapErr()).toBeInstanceOf(MalformedRequestResponse);
  });
});
