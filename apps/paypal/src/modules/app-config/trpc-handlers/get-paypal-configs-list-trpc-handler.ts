import { captureException } from "@sentry/nextjs";
import { TRPCError } from "@trpc/server";

import { PayPalFrontendConfig } from "@/modules/app-config/domain/paypal-config";
import { createSaleorApiUrl } from "@/modules/saleor/saleor-api-url";
import { protectedClientProcedure } from "@/modules/trpc/protected-client-procedure";
import { PayPalMultiConfigMetadataManager } from "@/modules/paypal/configuration/paypal-multi-config-metadata-manager";

export class GetPayPalConfigsListTrpcHandler {
  baseProcedure = protectedClientProcedure;

  getTrpcProcedure() {
    return this.baseProcedure.query(async ({ ctx }) => {
        if (!ctx.saleorApiUrl || !ctx.appId || !ctx.appToken) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Missing required request parameters",
          });
        }      const saleorApiUrl = createSaleorApiUrl(ctx.saleorApiUrl);

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
        });      const configsResult = await metadataManager.getAllConfigs();

      if (configsResult.isErr()) {
        captureException(configsResult.error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch configurations",
        });
      }

      // Convert to frontend format
      return configsResult.value.map(config => {
        return PayPalFrontendConfig.createFromSerializedFields({
          name: config.name,
          id: config.id,
          clientId: config.clientId,
          environment: config.environment,
        });
      });
    });
  }
}
