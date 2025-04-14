import { TRPCError } from "@trpc/server";
import { z } from "zod";

import { StripeFrontendConfig } from "@/modules/app-config/stripe-config";
import { SaleorApiUrl } from "@/modules/saleor/saleor-api-url";
import { protectedClientProcedure } from "@/modules/trpc/protected-client-procedure";

export class GetStripeConfigTrpcHandler {
  baseProcedure = protectedClientProcedure;

  getTrpcProcedure() {
    return this.baseProcedure
      .input(
        z.object({
          configId: z.string().uuid(),
        }),
      )
      .query(async ({ input, ctx }) => {
        const saleorApiUrl = SaleorApiUrl.create({ url: ctx.saleorApiUrl });

        /**
         * TODO: Extract such logic to be shared between handlers
         */
        if (saleorApiUrl.isErr()) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Malformed request",
          });
        }

        const config = await ctx.configRepo.getStripeConfig({
          configId: input.configId,
          saleorApiUrl: saleorApiUrl.value,
          appId: ctx.appId,
        });

        if (config.isErr()) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "App failed to fetch config, please contact Saleor",
          });
        }

        if (!config.value) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Config not found",
          });
        }

        return StripeFrontendConfig.createFromStripeConfig(config.value);
      });
  }
}
