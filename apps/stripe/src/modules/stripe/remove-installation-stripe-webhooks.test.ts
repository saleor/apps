import { DecryptionError } from "@saleor/apps-shared/key-rotation/rotating-encryptor";
import { err, ok } from "neverthrow";
import Stripe from "stripe";
import { describe, expect, it, vi } from "vitest";

import { mockedAppConfigRepo } from "@/__tests__/mocks/app-config-repo";
import { mockedSaleorAppId } from "@/__tests__/mocks/constants";
import { mockedStripeConfig } from "@/__tests__/mocks/mock-stripe-config";
import { mockedSaleorApiUrl } from "@/__tests__/mocks/saleor-api-url";
import { AppRootConfig } from "@/modules/app-config/domain/app-root-config";
import { StripeConfig } from "@/modules/app-config/domain/stripe-config";
import { AppConfigRepoError } from "@/modules/app-config/repositories/app-config-repo";
import { createRemoveInstallationStripeWebhooks } from "@/modules/stripe/remove-installation-stripe-webhooks";
import { StripeWebhookManagerErrors } from "@/modules/stripe/stripe-webhook-manager";

const secondConfig = StripeConfig.create({
  ...mockedStripeConfig,
  id: "second",
  webhookId: "wh_second",
})._unsafeUnwrap();

const removeWith = (removeWebhook: ReturnType<typeof vi.fn>) => {
  mockedAppConfigRepo.getRootConfig.mockResolvedValue(
    ok(
      new AppRootConfig({}, { [mockedStripeConfig.id]: mockedStripeConfig, second: secondConfig }),
    ),
  );

  return createRemoveInstallationStripeWebhooks({
    configRepo: mockedAppConfigRepo,
    webhookManager: { removeWebhook },
  })({ saleorApiUrl: mockedSaleorApiUrl, appId: mockedSaleorAppId });
};

const stripeError = (statusCode: number) =>
  err(
    new StripeWebhookManagerErrors.CantRemoveWebhookError("Error removing webhook", {
      cause: Stripe.errors.StripeError.generate({ type: "invalid_request_error", statusCode }),
    }),
  );

describe("createRemoveInstallationStripeWebhooks", () => {
  it("Removes the webhook of every config with its restricted key", async () => {
    const removeWebhook = vi.fn().mockResolvedValue(ok(null));

    await removeWith(removeWebhook);

    expect(mockedAppConfigRepo.getRootConfig).toHaveBeenCalledWith({
      saleorApiUrl: mockedSaleorApiUrl,
      appId: mockedSaleorAppId,
    });
    expect(removeWebhook.mock.calls).toStrictEqual([
      [{ webhookId: "wh_123456789", restrictedKey: mockedStripeConfig.restrictedKey }],
      [{ webhookId: "wh_second", restrictedKey: mockedStripeConfig.restrictedKey }],
    ]);
  });

  it.each([401, 403, 404])(
    "Treats Stripe %i (webhook gone, key revoked) as done",
    async (statusCode) => {
      const removeWebhook = vi.fn().mockResolvedValue(stripeError(statusCode));

      await expect(removeWith(removeWebhook)).resolves.toBeUndefined();
      expect(removeWebhook).toHaveBeenCalledTimes(2);
    },
  );

  it("Throws on other Stripe errors, so the installation is retried", async () => {
    const removeWebhook = vi.fn().mockResolvedValue(stripeError(500));

    await expect(removeWith(removeWebhook)).rejects.toBeInstanceOf(
      StripeWebhookManagerErrors.CantRemoveWebhookError,
    );
  });

  it("Skips webhook removal when the config was encrypted with a key that's gone", async () => {
    const removeWebhook = vi.fn();

    mockedAppConfigRepo.getRootConfig.mockResolvedValue(
      err(
        new AppConfigRepoError.FailureFetchingConfig("Error fetching RootConfig from DynamoDB", {
          cause: new DecryptionError("Failed to decrypt with primary key and 0 fallback key(s)."),
        }),
      ),
    );

    await expect(
      createRemoveInstallationStripeWebhooks({
        configRepo: mockedAppConfigRepo,
        webhookManager: { removeWebhook },
      })({ saleorApiUrl: mockedSaleorApiUrl, appId: mockedSaleorAppId }),
    ).resolves.toBeUndefined();
    expect(removeWebhook).not.toHaveBeenCalled();
  });

  it("Throws when the config can't be read", async () => {
    mockedAppConfigRepo.getRootConfig.mockResolvedValue(
      err(new AppConfigRepoError.FailureFetchingConfig("DynamoDB down")),
    );

    await expect(
      createRemoveInstallationStripeWebhooks({
        configRepo: mockedAppConfigRepo,
        webhookManager: { removeWebhook: vi.fn() },
      })({ saleorApiUrl: mockedSaleorApiUrl, appId: mockedSaleorAppId }),
    ).rejects.toBeInstanceOf(AppConfigRepoError.FailureFetchingConfig);
  });
});
