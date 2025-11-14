import { APL } from "@saleor/app-sdk/APL";
import { err, ok } from "neverthrow";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { mockedAppConfigRepo } from "@/__tests__/mocks/app-config-repo";
import { mockAdyenWebhookUrl } from "@/__tests__/mocks/constants";
import { mockAuthData } from "@/__tests__/mocks/mock-auth-data";
import { mockedStripeConfig } from "@/__tests__/mocks/mock-stripe-config";
import { mockedStripePaymentIntentsApi } from "@/__tests__/mocks/mocked-stripe-payment-intents-api";
import { MockedTransactionRecorder } from "@/__tests__/mocks/mocked-transaction-recorder";
import { BaseError } from "@/lib/errors";
import { ITransactionEventReporter } from "@/modules/saleor/transaction-event-reporter";
import { StripeWebhookManager } from "@/modules/stripe/stripe-webhook-manager";
import { IStripeEventVerify, IStripePaymentIntentsApiFactory } from "@/modules/stripe/types";

import { StripeWebhookUseCase } from "./use-case";
import { WebhookParams } from "./webhook-params";

describe("StripeWebhookUseCase - Legacy event cases", () => {
  const rawEventBody = JSON.stringify({ id: 1 });

  const mockApl = {
    get: vi.fn(),
    set: vi.fn(),
    delete: vi.fn(),
    getAll: vi.fn(),
  } satisfies APL;

  let instance: StripeWebhookUseCase;

  const eventVerify = {
    verifyEvent: vi.fn(),
  } satisfies IStripeEventVerify;

  const webhookParams = WebhookParams.createFromWebhookUrl(mockAdyenWebhookUrl)._unsafeUnwrap();

  const mockEventReporter = {
    reportTransactionEvent: vi.fn(),
  } satisfies ITransactionEventReporter;

  const mockTransactionRecorder = new MockedTransactionRecorder();

  const webhookManager = new StripeWebhookManager();

  const stripePaymentIntentsApiFactory = {
    create: () => mockedStripePaymentIntentsApi,
  } satisfies IStripePaymentIntentsApiFactory;

  beforeEach(() => {
    vi.spyOn(webhookManager, "removeWebhook");

    mockApl.get.mockImplementation(async () => {
      return { ...mockAuthData, appId: "different-app-id" };
    });

    mockTransactionRecorder.reset();

    instance = new StripeWebhookUseCase({
      apl: mockApl,
      appConfigRepo: mockedAppConfigRepo,
      webhookEventVerifyFactory: () => eventVerify,
      transactionEventReporterFactory() {
        return mockEventReporter;
      },
      transactionRecorder: mockTransactionRecorder,
      webhookManager,
      stripePaymentIntentsApiFactory,
    });
  });

  describe("Once event received comes from different app ID than currently resolved from AuthData", () => {
    it("Will remove webhook and return 200 to Stripe", async () => {
      vi.mocked(webhookManager.removeWebhook).mockImplementationOnce(async () => ok(null));

      const result = await instance.execute({
        rawBody: rawEventBody,
        webhookParams: webhookParams,
        signatureHeader: "",
      });

      expect(webhookManager.removeWebhook).toHaveBeenCalledExactlyOnceWith({
        restrictedKey: mockedStripeConfig.restrictedKey,
        webhookId: mockedStripeConfig.webhookId,
      });

      expect(result.isOk()).toBe(true);

      expect(mockedAppConfigRepo.getChannelConfig).toHaveBeenCalledExactlyOnceWith(
        expect.objectContaining({
          appId: webhookParams.appId,
        }),
      );
    });

    it("Will return 500 to Stripe if legacy config matching legacy event not found", async () => {
      vi.mocked(mockedAppConfigRepo.getChannelConfig).mockImplementationOnce(async () => ok(null));

      const result = await instance.execute({
        rawBody: rawEventBody,
        webhookParams: webhookParams,
        signatureHeader: "",
      });

      expect(result.isErr()).toBe(true);

      expect(result._unsafeUnwrapErr()).toMatchInlineSnapshot(`
        StripeWebhookAppIsNotConfiguredResponse {
          "message": "App is not configured",
          "statusCode": 400,
        }
      `);

      expect(mockedAppConfigRepo.getChannelConfig).toHaveBeenCalledOnce();
    });

    it("Will return 500 to Stripe if can't access DB to fetch config", async () => {
      vi.mocked(mockedAppConfigRepo.getChannelConfig).mockImplementationOnce(async () =>
        err(new BaseError("test err")),
      );

      const result = await instance.execute({
        rawBody: rawEventBody,
        webhookParams: webhookParams,
        signatureHeader: "",
      });

      expect(result.isErr()).toBe(true);

      expect(result._unsafeUnwrapErr()).toMatchInlineSnapshot(`
        StripeWebhookAppIsNotConfiguredResponse {
          "message": "App is not configured",
          "statusCode": 400,
        }
      `);

      expect(mockedAppConfigRepo.getChannelConfig).toHaveBeenCalledOnce();
    });

    it("Will return 500 to Stripe if can't remove webhook for some reason", async () => {
      vi.mocked(webhookManager.removeWebhook).mockImplementationOnce(async () =>
        err(new BaseError("error removing webhook")),
      );

      const result = await instance.execute({
        rawBody: rawEventBody,
        webhookParams: webhookParams,
        signatureHeader: "",
      });

      expect(result.isErr()).toBe(true);

      expect(result._unsafeUnwrapErr()).toMatchInlineSnapshot(`
        StripeWebhookAppIsNotConfiguredResponse {
          "message": "App is not configured",
          "statusCode": 400,
        }
      `);

      expect(mockedAppConfigRepo.getChannelConfig).toHaveBeenCalledOnce();
    });
  });
});
