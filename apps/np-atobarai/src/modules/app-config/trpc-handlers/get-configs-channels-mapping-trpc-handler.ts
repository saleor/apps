import { createSaleorApiUrl } from "@saleor/apps-domain/saleor-api-url";
import { TRPCError } from "@trpc/server";

import { AppChannelConfigFields } from "@/modules/app-config/app-config";
import { protectedClientProcedure } from "@/modules/trpc/protected-client-procedure";

export class GetConfigsChannelsMappingTrpcHandler {
  baseProcedure = protectedClientProcedure;

  getTrpcProcedure() {
    return this.baseProcedure.query(
      async ({ ctx }): Promise<Record<string, AppChannelConfigFields>> => {
        const saleorApiUrl = createSaleorApiUrl(ctx.saleorApiUrl);

        const config = await ctx.configRepo.getRootConfig({
          saleorApiUrl: saleorApiUrl,
          appId: ctx.appId,
        });

        if (config.isErr()) {
          console.error("Failed to fetch app config", config.error);
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "App failed to fetch config, please contact Saleor",
          });
        }

        const mapping = config.value.chanelConfigMapping;
        const allConfigs = config.value.configsById;

        return Object.entries(mapping).reduce(
          (acc, [channelID, configId]) => {
            const config = allConfigs[configId];

            if (config) {
              // todo map to encrypt
              acc[channelID] = config;
            }

            return acc;
          },
          {} as Record<string, AppChannelConfigFields>,
        );
      },
    );
  }
}
