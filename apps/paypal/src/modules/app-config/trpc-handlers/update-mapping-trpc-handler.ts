import { captureException } from "@sentry/nextjs";
import { TRPCError } from "@trpc/server";
import { z } from "zod";

import { BaseError } from "@/lib/errors";
import { createSaleorApiUrl } from "@/modules/saleor/saleor-api-url";
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

        const saveResult = await ctx.configRepo.updateMapping(
          {
            saleorApiUrl: saleorApiUrl.value,
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
            message: "Failed to create PayPal configuration. Data can't be saved.",
          });
        }
      });
  }
}
