import { captureException } from "@sentry/nextjs";
import { TRPCError } from "@trpc/server";

import {
  PayPalFrontendConfig,
  PayPalFrontendConfigSerializedFields,
} from "@/modules/app-config/domain/paypal-config";
import { createSaleorApiUrl } from "@/modules/saleor/saleor-api-url";
import { protectedClientProcedure } from "@/modules/trpc/protected-client-procedure";
import { PayPalMultiConfigMetadataManager } from "@/modules/paypal/configuration/paypal-multi-config-metadata-manager";

// todo test
export class GetPayPalConfigsChannelsMappingTrpcHandler {
  baseProcedure = protectedClientProcedure;

  getTrpcProcedure() {
    return this.baseProcedure.query(
      async ({ ctx }): Promise<Record<string, PayPalFrontendConfigSerializedFields>> => {
        if (!ctx.saleorApiUrl || !ctx.appId || !ctx.appToken) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Missing required request parameters",
          });
        }

        const saleorApiUrl = createSaleorApiUrl(ctx.saleorApiUrl);

        /**
         * TODO: Extract such logic to be shared between handlers
         * TODO CTX should have already created SaleorApiUrl instance, not Result
         */
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

        const rootConfigResult = await metadataManager.getRootConfig();
        if (rootConfigResult.isErr()) {
          captureException(rootConfigResult.error);
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to retrieve PayPal configurations",
          });
        }

        const rootConfig = rootConfigResult.value;
        const channelConfigMapping = rootConfig.channelConfigMapping;
        const paypalConfigsById = rootConfig.paypalConfigsById;

        // Convert to frontend format
        const result: Record<string, PayPalFrontendConfigSerializedFields> = {};
        
        Object.entries(channelConfigMapping).forEach(([channelId, configId]) => {
          const paypalConfig = paypalConfigsById[configId];
          if (paypalConfig) {
            result[channelId] = {
              id: paypalConfig.id,
              name: paypalConfig.name,
              clientId: paypalConfig.clientId,
              environment: paypalConfig.environment,
            };
          }
        });

        return result;
      },
    );
  }
}
