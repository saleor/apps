import { createAppDeletedHandler } from "@saleor/webhook-utils/app-deleted-handler";

import { createLogger } from "@/lib/logger";
import { saleorApp } from "@/lib/saleor-app";
import { appConfigRepoImpl } from "@/modules/app-config/repositories/app-config-repo-impl";
import { WipeAppDataUseCase } from "@/modules/app-uninstall/wipe-app-data-use-case";
import { createSaleorApiUrl } from "@/modules/saleor/saleor-api-url";
import { StripeWebhookManager } from "@/modules/stripe/stripe-webhook-manager";
import { transactionRecorder } from "@/modules/transactions-recording/repositories/transaction-recorder-impl";

const logger = createLogger("APP_DELETED handler");

const wipeAppDataUseCase = new WipeAppDataUseCase({
  appConfigRepo: appConfigRepoImpl,
  transactionRecorderRepo: transactionRecorder,
  stripeWebhookManager: new StripeWebhookManager(),
});

export const appDeletedWebhookDefinition = createAppDeletedHandler({
  apl: saleorApp.apl,
  logger,
  webhookPath: "api/webhooks/app-deleted",
  hooks: {
    onEvent: async (ctx) => {
      const saleorApiUrlResult = createSaleorApiUrl(ctx.authData.saleorApiUrl);

      if (saleorApiUrlResult.isErr()) {
        logger.error("Invalid saleorApiUrl in APP_DELETED context; skipping cleanup", {
          error: saleorApiUrlResult.error,
        });

        return;
      }

      await wipeAppDataUseCase.execute({
        saleorApiUrl: saleorApiUrlResult.value,
        appId: ctx.authData.appId,
      });
    },
  },
});
