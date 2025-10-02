import { TRPCError } from "@trpc/server";

import {
  PayPalFrontendConfig,
  PayPalFrontendConfigSerializedFields,
} from "@/modules/app-config/domain/paypal-config";
import { createSaleorApiUrl } from "@/modules/saleor/saleor-api-url";
import { protectedClientProcedure } from "@/modules/trpc/protected-client-procedure";

// todo test
export class GetPayPalConfigsChannelsMappingTrpcHandler {
  baseProcedure = protectedClientProcedure;

  getTrpcProcedure() {
    return this.baseProcedure.query(
      async ({ ctx }): Promise<Record<string, PayPalFrontendConfigSerializedFields>> => {
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

        const config = await ctx.configRepo.getPayPalConfig({
          saleorApiUrl: saleorApiUrl.value,
          appId: ctx.appId,
          token: ctx.token || "",
        });

        if (config.isErr()) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "App failed to fetch config, please contact Saleor",
          });
        }

        // In the new metadata approach, there's one config for all channels
        // Return empty mapping if no config exists
        if (!config.value) {
          return {} as Record<string, PayPalFrontendConfigSerializedFields>;
        }

        // For compatibility, we could return the same config for all channels
        // but since there's no channel info available here, return empty mapping
        // The UI will need to be updated to handle the single-config approach
        return {} as Record<string, PayPalFrontendConfigSerializedFields>;
      },
    );
  }
}
