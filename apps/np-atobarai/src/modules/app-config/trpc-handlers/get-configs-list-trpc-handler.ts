import { createSaleorApiUrl } from "@saleor/apps-domain/saleor-api-url";
import { captureException } from "@sentry/nextjs";
import { TRPCError } from "@trpc/server";

import { AppChannelConfig, AppChannelConfigFields } from "@/modules/app-config/app-config";
import { AtobaraiSecretSpCode } from "@/modules/atobarai/atobarai-secret-sp-code";
import { protectedClientProcedure } from "@/modules/trpc/protected-client-procedure";

export class GetConfigsListTrpcHandler {
  baseProcedure = protectedClientProcedure;

  constructor() {}

  private getFrontendConfig = async (config: AppChannelConfig): Promise<AppChannelConfigFields> => {
    return {
      ...config,
      secretSpCode: "***" as AtobaraiSecretSpCode,
    };
  };

  getTrpcProcedure() {
    return this.baseProcedure.query(async ({ ctx }) => {
      const saleorApiUrl = createSaleorApiUrl(ctx.saleorApiUrl);

      const config = await ctx.configRepo.getRootConfig({
        saleorApiUrl: saleorApiUrl,
        appId: ctx.appId,
      });

      if (config.isErr()) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "App failed to fetch config, please contact Saleor",
        });
      }

      const configsList = config.value.getAllConfigsAsList();
      const mappedPromises = configsList.map(this.getFrontendConfig);
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
