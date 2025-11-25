import { TRPCError } from "@trpc/server";

import { createLogger } from "@/lib/logger";
import { SaleorProductClient } from "@/modules/saleor/saleor-product-client";
import { protectedClientProcedure } from "@/modules/trpc/protected-client-procedure";

const logger = createLogger("GetChannelsTrpcHandler");

export const getChannelsTrpcHandler = protectedClientProcedure.query(async ({ ctx }) => {
  logger.debug("Fetching channels");

  const saleorClient = new SaleorProductClient(ctx.apiClient!);
  const result = await saleorClient.getChannels();

  if (result.isErr()) {
    logger.error("Failed to fetch channels", { error: result.error });
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "Failed to fetch channels",
    });
  }

  return result.value.map((channel) => ({
    id: channel.id,
    name: channel.name,
    slug: channel.slug,
    currencyCode: channel.currencyCode,
    isActive: channel.isActive,
  }));
});
