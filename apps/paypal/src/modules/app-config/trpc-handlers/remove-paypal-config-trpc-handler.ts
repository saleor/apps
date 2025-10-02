import { captureException } from "@sentry/nextjs";
import { TRPCError } from "@trpc/server";
import { z } from "zod";

import { createSaleorApiUrl } from "@/modules/saleor/saleor-api-url";
import { protectedClientProcedure } from "@/modules/trpc/protected-client-procedure";
import { PayPalMultiConfigMetadataManager } from "@/modules/paypal/configuration/paypal-multi-config-metadata-manager";

export class RemovePayPalConfigTrpcHandler {
  baseProcedure = protectedClientProcedure;

  getTrpcProcedure() {
    return this.baseProcedure
      .input(z.object({ configId: z.string() }))
      .mutation(async ({ input, ctx }) => {
        if (!ctx.saleorApiUrl || !ctx.appId || !ctx.appToken) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Missing required request parameters",
          });
        }

        const saleorApiUrl = createSaleorApiUrl(ctx.saleorApiUrl);

        if (saleorApiUrl.isErr()) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Malformed request",
          });
        }

        const metadataManager = PayPalMultiConfigMetadataManager.createFromAuthData({
          saleorApiUrl: saleorApiUrl.value,
          token: ctx.appToken,
          appId: ctx.appId,
        });

        const deleteResult = await metadataManager.deleteConfig(input.configId);
        
        if (deleteResult.isErr()) {
          captureException(deleteResult.error);
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to remove configuration.",
          });
        }

        console.log("Successfully deleted PayPal config:", input.configId);
        return { success: true };
      });
  }
}
