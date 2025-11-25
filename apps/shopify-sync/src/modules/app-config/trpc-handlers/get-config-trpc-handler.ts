import { TRPCError } from "@trpc/server";

import { createLogger } from "@/lib/logger";
import { protectedClientProcedure } from "@/modules/trpc/protected-client-procedure";

const logger = createLogger("GetConfigTrpcHandler");

export const getConfigTrpcHandler = protectedClientProcedure.query(async ({ ctx }) => {
  logger.debug("Fetching connection config");

  const result = await ctx.configRepo.get({
    saleorApiUrl: ctx.saleorApiUrl,
    appId: ctx.appId,
  });

  if (result.isErr()) {
    logger.error("Failed to fetch config", { error: result.error });
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "Failed to fetch configuration",
    });
  }

  const config = result.value;

  if (!config) {
    return null;
  }

  return {
    shopDomain: config.shopDomain,
    apiVersion: config.apiVersion,
    isConfigured: true,
  };
});
