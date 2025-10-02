import { captureException } from "@sentry/nextjs";
import { TRPCError } from "@trpc/server";
import { z } from "zod";

import { BaseError } from "@/lib/errors";
import { createSaleorApiUrl } from "@/modules/saleor/saleor-api-url";
import { protectedClientProcedure } from "@/modules/trpc/protected-client-procedure";
import { PayPalMultiConfigMetadataManager } from "@/modules/paypal/configuration/paypal-multi-config-metadata-manager";

export class UpdateMappingTrpcHandler {
  baseProcedure = protectedClientProcedure;

  getTrpcProcedure() {
    return this.baseProcedure
      .input(
        z.object({
          configId: z.string().uuid().optional(),
          channelId: z.string(),
        }),
      )
      .mutation(async ({ input, ctx }) => {
        if (!ctx.saleorApiUrl || !ctx.appId || !ctx.appToken) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Missing required request parameters",
          });
        }

        const saleorApiUrl = createSaleorApiUrl(ctx.saleorApiUrl);

        /**
         * TODO: Extract such logic to be shared between handlers
         */
        if (saleorApiUrl.isErr()) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Malformed request",
          });
        }

        if (!ctx.appUrl) {
          captureException(new BaseError("Missing appUrl in TRPC request"));

          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Something went wrong, please contact support.",
          });
        }

        const { channelId, configId } = input;
        
        const metadataManager = PayPalMultiConfigMetadataManager.createFromAuthData({
          saleorApiUrl: saleorApiUrl.value,
          token: ctx.appToken,
          appId: ctx.appId,
        });
        
        // Debug: Log all existing configs for troubleshooting
        const allConfigsResult = await metadataManager.getAllConfigs();
        if (allConfigsResult.isOk()) {
          console.log("Available PayPal configs:", allConfigsResult.value.map(c => ({ id: c.id, name: c.name })));
        }
        console.log("Requested configId:", configId);
        console.log("Target channelId:", channelId);
        
        // Validate that config exists if configId is provided
        if (configId) {
          const configResult = await metadataManager.getConfigById(configId);
          if (configResult.isErr()) {
            captureException(configResult.error);
            throw new TRPCError({
              code: "INTERNAL_SERVER_ERROR",
              message: `Failed to validate config: ${configResult.error.message}`,
            });
          }
          
          if (!configResult.value) {
            console.log("Config not found, available configs:", allConfigsResult.isOk() ? allConfigsResult.value.length : "unknown");
            throw new TRPCError({
              code: "NOT_FOUND",
              message: `PayPal configuration with ID ${configId} not found. Available configs: ${allConfigsResult.isOk() ? allConfigsResult.value.length : 0}`,
            });
          }
        }
        
        // Update channel mapping
        const updateResult = await metadataManager.updateChannelMapping(channelId, configId || null);
        if (updateResult.isErr()) {
          captureException(updateResult.error);
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: `Failed to update channel mapping: ${updateResult.error.message}`,
          });
        }
        
        return { success: true };
      });
  }
}
