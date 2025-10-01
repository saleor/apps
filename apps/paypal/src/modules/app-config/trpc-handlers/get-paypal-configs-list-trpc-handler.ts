import { captureException } from "@sentry/nextjs";
import { TRPCError } from "@trpc/server";

import { PayPalConfig, PayPalFrontendConfig } from "@/modules/app-config/domain/paypal-config";
import { createSaleorApiUrl } from "@/modules/saleor/saleor-api-url";
import { PayPalWebhookManager } from "@/modules/paypal/paypal-webhook-manager";
import { protectedClientProcedure } from "@/modules/trpc/protected-client-procedure";

// todo test
export class GetPayPalConfigsListTrpcHandler {
  baseProcedure = protectedClientProcedure;

  webhookManager: PayPalWebhookManager;

  constructor(
    deps: { webhookManager: PayPalWebhookManager } = {
      webhookManager: new PayPalWebhookManager(),
    },
  ) {
    this.webhookManager = deps.webhookManager;
  }

  private getFrontendConfigWithWebhookStatus = async (
    config: PayPalConfig,
  ): Promise<PayPalFrontendConfig> => {
    const webhookResult = await this.webhookManager.getWebhook({
      webhookId: config.webhookId,
      clientSecret: config.clientSecret,
    });

    const frontendConfig = PayPalFrontendConfig.createFromPayPalConfig(config);

    if (webhookResult.isErr()) {
      frontendConfig.webhookStatus = "missing";
    }

    if (webhookResult.isOk()) {
      const isActive = webhookResult.value.status === "enabled";

      frontendConfig.webhookStatus = isActive ? "active" : "disabled";
    }

    return frontendConfig;
  };

  getTrpcProcedure() {
    return this.baseProcedure.query(async ({ ctx }) => {
      const saleorApiUrl = createSaleorApiUrl(ctx.saleorApiUrl);

      /**
       * TODO: Extract such logic to be shared between handlers
       * TODO CTX should have already created SaleorApiUrl instance, not Result
       */
      if (saleorApiUrl.isErr()) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Malformed request",
        });
      }

      const config = await ctx.configRepo.getRootConfig({
        saleorApiUrl: saleorApiUrl.value,
        appId: ctx.appId,
      });

      if (config.isErr()) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "App failed to fetch config, please contact Saleor",
        });
      }

      const configsList = config.value.getAllConfigsAsList();
      const mappedPromises = configsList.map(this.getFrontendConfigWithWebhookStatus);
      const results = await Promise.all(mappedPromises).catch((e) => {
        captureException(e);

        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch configurations, try again",
        });
      });

      return results;
    });
  }
}
