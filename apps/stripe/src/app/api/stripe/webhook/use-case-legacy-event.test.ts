import { APL } from "@saleor/app-sdk/APL";
import { err, ok } from "neverthrow";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { mockedAppConfigRepo } from "@/__tests__/mocks/app-config-repo";
import { mockAdyenWebhookUrl } from "@/__tests__/mocks/constants";
import { mockAuthData } from "@/__tests__/mocks/mock-auth-data";
import { mockedStripeConfig } from "@/__tests__/mocks/mock-stripe-config";
import { MockedTransactionRecorder } from "@/__tests__/mocks/mocked-transaction-recorder";
import { StripeWebhookUseCase } from "@/app/api/stripe/webhook/use-case";
import { WebhookParams } from "@/app/api/stripe/webhook/webhook-params";
import { BaseError } from "@/lib/errors";
import { ITransactionEventReporter } from "@/modules/saleor/transaction-event-reporter";
import { StripeWebhookManager } from "@/modules/stripe/stripe-webhook-manager";
import { IStripeEventVerify } from "@/modules/stripe/types";

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

      expect(mockedAppConfigRepo.getStripeConfig).toHaveBeenCalledExactlyOnceWith(
        expect.objectContaining({
          appId: webhookParams.appId,
        }),
      );
    });

    it("Will return 500 to Stripe if legacy config matching legacy event not found", async () => {
      vi.mocked(mockedAppConfigRepo.getStripeConfig).mockImplementationOnce(async () => ok(null));

      const result = await instance.execute({
        rawBody: rawEventBody,
        webhookParams: webhookParams,
        signatureHeader: "",
      });

      expect(result.isErr()).toBe(true);

      expect(result._unsafeUnwrapErr()).toMatchInlineSnapshot(`
        StripeWebhookErrorResponse {
          "error": [BaseError: Legacy config is empty
        Received legacy webhook but failed to handle removing it],
          "responseStatusCode": 500,
        }
      `);

      expect(mockedAppConfigRepo.getStripeConfig).toHaveBeenCalledOnce();
    });

    it("Will return 500 to Stripe if can't access DB to fetch config", async () => {
      vi.mocked(mockedAppConfigRepo.getStripeConfig).mockImplementationOnce(async () =>
        err(new BaseError("test err")),
      );

      const result = await instance.execute({
        rawBody: rawEventBody,
        webhookParams: webhookParams,
        signatureHeader: "",
      });

      expect(result.isErr()).toBe(true);

      expect(result._unsafeUnwrapErr()).toMatchInlineSnapshot(`
        StripeWebhookErrorResponse {
          "error": [BaseError: test err
        Failed to fetch config attached to legacy Webhook, this requires manual cleanup
        Failed to fetch legacy config
        Received legacy webhook but failed to handle removing it],
          "responseStatusCode": 500,
        }
      `);

      expect(mockedAppConfigRepo.getStripeConfig).toHaveBeenCalledOnce();
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
        StripeWebhookErrorResponse {
          "error": [BaseError: error removing webhook
        Failed to remove webhook
        Failed to remove legacy webhook
        Received legacy webhook but failed to handle removing it],
          "responseStatusCode": 500,
        }
      `);

      expect(mockedAppConfigRepo.getStripeConfig).toHaveBeenCalledOnce();
    });
  });
});
