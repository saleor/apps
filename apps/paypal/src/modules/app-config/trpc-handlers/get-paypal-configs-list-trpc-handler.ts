import { captureException } from "@sentry/nextjs";
import { TRPCError } from "@trpc/server";

import { PayPalFrontendConfig } from "@/modules/app-config/domain/paypal-config";
import { createSaleorApiUrl } from "@/modules/saleor/saleor-api-url";
import { protectedClientProcedure } from "@/modules/trpc/protected-client-procedure";

export class GetPayPalConfigsListTrpcHandler {
  baseProcedure = protectedClientProcedure;

  getTrpcProcedure() {
    return this.baseProcedure.query(async ({ ctx }) => {
      const saleorApiUrl = createSaleorApiUrl(ctx.saleorApiUrl);

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
        captureException(config.error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch configuration",
        });
      }

      // Return as array for compatibility with UI expecting multiple configs
      if (!config.value) {
        return [];
      }

      // Convert new PayPalConfig to format expected by PayPalFrontendConfig
      const frontendConfig = PayPalFrontendConfig.createFromSerializedFields({
        name: config.value.name,
        id: config.value.id,
        clientId: config.value.clientId,
        environment: config.value.environment,
      });

      return [frontendConfig];
    });
  }
}
