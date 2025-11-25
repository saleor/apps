import { TRPCError } from "@trpc/server";
import { z } from "zod";

import { createLogger } from "@/lib/logger";
import { ShopifyConnectionConfig } from "@/modules/app-config/domain/shopify-connection-config";
import { protectedClientProcedure } from "@/modules/trpc/protected-client-procedure";

const logger = createLogger("SaveConfigTrpcHandler");

const saveConfigInputSchema = z.object({
  shopDomain: z.string().min(1, "Shop domain is required"),
  accessToken: z.string().min(1, "Access token is required"),
  apiVersion: z.string().optional().default("2024-10"),
});

export const saveConfigTrpcHandler = protectedClientProcedure
  .input(saveConfigInputSchema)
  .mutation(async ({ ctx, input }) => {
    logger.debug("Saving connection config", { shopDomain: input.shopDomain });

    const configResult = ShopifyConnectionConfig.create({
      shopDomain: input.shopDomain,
      accessToken: input.accessToken,
      apiVersion: input.apiVersion,
    });

    if (configResult.isErr()) {
      logger.error("Invalid config input", { error: configResult.error });
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "Invalid configuration",
      });
    }

    const saveResult = await ctx.configRepo.save({
      saleorApiUrl: ctx.saleorApiUrl,
      appId: ctx.appId,
      config: configResult.value,
    });

    if (saveResult.isErr()) {
      logger.error("Failed to save config", { error: saveResult.error });
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to save configuration",
      });
    }

    return { success: true };
  });
