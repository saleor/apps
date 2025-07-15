import { createSaleorApiUrl } from "@saleor/apps-domain/saleor-api-url";
import { BaseError } from "@saleor/errors";
import { captureException } from "@sentry/nextjs";
import { TRPCError } from "@trpc/server";
import { z } from "zod";

import { protectedClientProcedure } from "@/modules/trpc/protected-client-procedure";

export class UpdateMappingTrpcHandler {
  baseProcedure = protectedClientProcedure;

  getTrpcProcedure() {
    return this.baseProcedure
      .input(
        z.object({
          configId: z.string().uuid(),
          channelId: z.string(),
        }),
      )
      .mutation(async ({ input, ctx }) => {
        const saleorApiUrl = createSaleorApiUrl(ctx.saleorApiUrl);

        if (!ctx.appUrl) {
          captureException(new BaseError("Missing appUrl in TRPC request"));

          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Something went wrong, please contact support.",
          });
        }

        const saveResult = await ctx.configRepo.updateMapping(
          {
            saleorApiUrl: saleorApiUrl,
            appId: ctx.appId,
          },
          {
            configId: input.configId,
            channelId: input.channelId,
          },
        );

        if (saveResult.isErr()) {
          // TODO Handle exact errors
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to create Stripe configuration. Data can't be saved.",
          });
        }
      });
  }
}
