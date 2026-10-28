import { type AppConfigRepo } from "@/modules/app-config/repositories/app-config-repo";
import { createSaleorApiUrl } from "@/modules/saleor/saleor-api-url";
import { type StripeWebhookManager } from "@/modules/stripe/stripe-webhook-manager";

/*
 * Webhook already gone (404) or restricted key revoked / without access (401, 403): retrying won't
 * help. BaseError merges its cause's own properties (Stripe's `statusCode`, `DecryptionError`'s
 * `decryptionFailed`) into itself.
 */
const isPermanentStripeError = (error: Error) =>
  [401, 403, 404].includes((error as { statusCode?: number }).statusCode ?? 0);

/**
 * Removes the Stripe webhooks of an installation whose Saleor environment is gone, using each
 * config's restricted key, so the merchant's Stripe account stops sending events to the app.
 * For the stale installations cleanup: throws to keep the installation for the next run.
 */
export const createRemoveInstallationStripeWebhooks =
  ({
    configRepo,
    webhookManager,
  }: {
    configRepo: AppConfigRepo;
    webhookManager: Pick<StripeWebhookManager, "removeWebhook">;
  }) =>
  async ({ saleorApiUrl, appId }: { saleorApiUrl: string; appId: string }): Promise<void> => {
    const rootConfig = await configRepo.getRootConfig({
      saleorApiUrl: createSaleorApiUrl(saleorApiUrl)._unsafeUnwrap(),
      appId,
    });

    if (rootConfig.isErr()) {
      // Config encrypted with a key that's gone: nobody can read its restricted key to remove the webhook.
      if ((rootConfig.error as { decryptionFailed?: boolean }).decryptionFailed) {
        return;
      }

      throw rootConfig.error;
    }

    for (const { webhookId, restrictedKey } of rootConfig.value.getAllConfigsAsList()) {
      const removed = await webhookManager.removeWebhook({ webhookId, restrictedKey });

      if (removed.isErr() && !isPermanentStripeError(removed.error)) {
        throw removed.error;
      }
    }
  };
