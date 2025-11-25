import { TRPCError } from "@trpc/server";

import { createLogger } from "@/lib/logger";
import { protectedClientProcedure } from "@/modules/trpc/protected-client-procedure";

const logger = createLogger("DeleteConfigTrpcHandler");

export const deleteConfigTrpcHandler = protectedClientProcedure.mutation(async ({ ctx }) => {
  logger.debug("Deleting connection config");

  const result = await ctx.configRepo.delete({
    saleorApiUrl: ctx.saleorApiUrl,
    appId: ctx.appId,
  });

  if (result.isErr()) {
    logger.error("Failed to delete config", { error: result.error });
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "Failed to delete configuration",
    });
  }

  return { success: true };
});
