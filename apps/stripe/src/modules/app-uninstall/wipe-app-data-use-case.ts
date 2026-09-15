import { createLogger } from "@/lib/logger";
import { type StripeConfig } from "@/modules/app-config/domain/stripe-config";
import { type AppConfigRepo } from "@/modules/app-config/repositories/app-config-repo";
import { type SaleorApiUrl } from "@/modules/saleor/saleor-api-url";
import { type StripeWebhookManager } from "@/modules/stripe/stripe-webhook-manager";
import { type TransactionRecorderRepo } from "@/modules/transactions-recording/repositories/transaction-recorder-repo";

type Deps = {
  appConfigRepo: AppConfigRepo;
  transactionRecorderRepo: TransactionRecorderRepo;
  stripeWebhookManager: StripeWebhookManager;
};

type ExecuteArgs = {
  saleorApiUrl: SaleorApiUrl;
  appId: string;
};

/**
 * Cleans up all app-owned data when the app is uninstalled from Saleor.
 * Best-effort: failures are logged but never thrown. Caller (APP_DELETED hook)
 * proceeds to delete APL regardless.
 */
export class WipeAppDataUseCase {
  private readonly logger = createLogger("WipeAppDataUseCase");
  private readonly appConfigRepo: AppConfigRepo;
  private readonly transactionRecorderRepo: TransactionRecorderRepo;
  private readonly stripeWebhookManager: StripeWebhookManager;

  constructor(deps: Deps) {
    this.appConfigRepo = deps.appConfigRepo;
    this.transactionRecorderRepo = deps.transactionRecorderRepo;
    this.stripeWebhookManager = deps.stripeWebhookManager;
  }

  async execute({ saleorApiUrl, appId }: ExecuteArgs): Promise<void> {
    const access = { saleorApiUrl, appId };

    this.logger.info("Wiping app data for uninstall", { saleorApiUrl, appId });

    const configsResult = await this.appConfigRepo.getAllConfigs(access);

    const configs = configsResult.isOk() ? configsResult.value : [];

    if (configsResult.isErr()) {
      this.logger.error("Failed to fetch configs; Stripe webhooks will not be removed", {
        error: configsResult.error,
        saleorApiUrl,
        appId,
      });
    }

    this.logger.info("Fetched configs for uninstall cleanup", {
      saleorApiUrl,
      appId,
      configCount: configs.length,
    });

    const [stripeWebhookOutcomes, removeConfigsResult, removeMappingsResult, removeTxResult] =
      await Promise.all([
        this.removeStripeWebhooks(configs),
        this.appConfigRepo.removeAllConfigs(access),
        this.appConfigRepo.removeAllChannelMappings(access),
        this.transactionRecorderRepo.removeAllForApp(access),
      ]);

    if (removeConfigsResult.isErr()) {
      this.logger.error("Failed to remove StripeConfig items", {
        entity: "configs",
        error: removeConfigsResult.error,
        saleorApiUrl,
        appId,
      });
    } else {
      this.logger.info("Removed StripeConfig items", {
        entity: "configs",
        saleorApiUrl,
        appId,
      });
    }

    if (removeMappingsResult.isErr()) {
      this.logger.error("Failed to remove ChannelConfigMapping items", {
        entity: "channelMappings",
        error: removeMappingsResult.error,
        saleorApiUrl,
        appId,
      });
    } else {
      this.logger.info("Removed ChannelConfigMapping items", {
        entity: "channelMappings",
        saleorApiUrl,
        appId,
      });
    }

    if (removeTxResult.isErr()) {
      this.logger.error("Failed to remove RecordedTransaction items", {
        entity: "transactions",
        error: removeTxResult.error,
        saleorApiUrl,
        appId,
      });
    } else {
      this.logger.info("Removed RecordedTransaction items", {
        entity: "transactions",
        saleorApiUrl,
        appId,
      });
    }

    const dbWipesSucceeded = [removeConfigsResult, removeMappingsResult, removeTxResult].filter(
      (r) => r.isOk(),
    ).length;
    const dbWipesFailed = 3 - dbWipesSucceeded;

    this.logger.info("App data wipe completed", {
      saleorApiUrl,
      appId,
      stripeWebhooksDeleted: stripeWebhookOutcomes.deleted,
      stripeWebhooksFailed: stripeWebhookOutcomes.failed,
      stripeWebhooksSkipped: stripeWebhookOutcomes.skipped,
      dbWipesSucceeded,
      dbWipesFailed,
    });
  }

  private async removeStripeWebhooks(
    configs: StripeConfig[],
  ): Promise<{ deleted: number; failed: number; skipped: number }> {
    let deleted = 0;
    let failed = 0;
    let skipped = 0;

    const results = await Promise.allSettled(
      configs.map(async (config) => {
        if (!config.webhookId) {
          this.logger.warn("StripeConfig missing webhookId; skipping Stripe webhook removal", {
            configId: config.id,
          });
          skipped += 1;

          return;
        }

        const result = await this.stripeWebhookManager.removeWebhook({
          webhookId: config.webhookId,
          restrictedKey: config.restrictedKey,
        });

        if (result.isErr()) {
          this.logger.error("Failed to remove Stripe webhook", {
            configId: config.id,
            stripeWhId: config.webhookId,
            error: result.error,
          });
          failed += 1;

          return;
        }

        this.logger.info("Removed Stripe webhook", {
          configId: config.id,
          stripeWhId: config.webhookId,
        });
        deleted += 1;
      }),
    );

    for (const r of results) {
      if (r.status === "rejected") {
        this.logger.error("Unexpected rejection in Stripe webhook removal", { reason: r.reason });
        failed += 1;
      }
    }

    return { deleted, failed, skipped };
  }
}
