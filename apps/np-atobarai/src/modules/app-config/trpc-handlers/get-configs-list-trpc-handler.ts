import { createSaleorApiUrl } from "@saleor/apps-domain/saleor-api-url";
import { captureException } from "@sentry/nextjs";
import { TRPCError } from "@trpc/server";

import { protectedClientProcedure } from "@/modules/trpc/protected-client-procedure";

export class GetConfigsListTrpcHandler {
  baseProcedure = protectedClientProcedure;

  constructor() {}

  private getFrontendConfigWithWebhookStatus = async (
    config: StripeConfig,
  ): Promise<StripeFrontendConfig> => {
    const webhookResult = await this.webhookManager.getWebhook({
      webhookId: config.webhookId,
      restrictedKey: config.restrictedKey,
    });

    const frontendConfig = StripeFrontendConfig.createFromStripeConfig(config);

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
