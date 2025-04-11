import { TRPCError } from "@trpc/server";
import { z } from "zod";

import { getStripeConfigTrpcHandler } from "@/modules/app-config/trpc-handlers/get-stripe-config-trpc-handler";
import { newStripeConfigSchema } from "@/modules/app-config/trpc-handlers/save-new-stripe-config-trpc-handler";
import { SaleorApiUrl } from "@/modules/saleor/saleor-api-url";
import { protectedClientProcedure } from "@/modules/trpc/protected-client-procedure";
import { router } from "@/modules/trpc/trpc-server";

/**
 * TODO Figure out end-to-end router testing (must somehow check valid jwt token)
 */
export const appConfigRouter = router({
  getStripeConfig: protectedClientProcedure
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

      return getStripeConfigTrpcHandler({
        configId: input.configId,
        saleorApiUrl: saleorApiUrl.value,
        appId: ctx.appId,
        configRepo: ctx.configRepo,
      });
    }),
  saveNewStripeConfig: protectedClientProcedure
    .input(newStripeConfigSchema)
    .query(({ ctx, input }) => {}),
});
