import { TRPCError } from "@trpc/server";
import { z } from "zod";

import { createLogger } from "@/lib/logger";
import { SaleorProductClient } from "@/modules/saleor/saleor-product-client";
import { ShopifyClient } from "@/modules/shopify/shopify-client";
import { ExportToShopifyUseCase } from "@/modules/sync/export-to-shopify-use-case";
import { protectedClientProcedure } from "@/modules/trpc/protected-client-procedure";

const logger = createLogger("ExportProductsTrpcHandler");

const exportProductsInputSchema = z.object({
  channelSlug: z.string().min(1, "Channel slug is required"),
});

export const exportProductsTrpcHandler = protectedClientProcedure
  .input(exportProductsInputSchema)
  .mutation(async ({ ctx, input }) => {
    logger.info("Starting product export", { channelSlug: input.channelSlug });

    const configResult = await ctx.configRepo.get({
      saleorApiUrl: ctx.saleorApiUrl,
      appId: ctx.appId,
    });

    if (configResult.isErr()) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to fetch Shopify configuration",
      });
    }

    if (!configResult.value) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "Shopify is not configured. Please configure the connection first.",
      });
    }

    const shopifyClient = new ShopifyClient(configResult.value);
    const saleorClient = new SaleorProductClient(ctx.apiClient!);

    const useCase = new ExportToShopifyUseCase(saleorClient, shopifyClient);
    const result = await useCase.execute({ channelSlug: input.channelSlug });

    if (result.isErr()) {
      logger.error("Export failed", { error: result.error });
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: result.error.message,
      });
    }

    return result.value;
  });
