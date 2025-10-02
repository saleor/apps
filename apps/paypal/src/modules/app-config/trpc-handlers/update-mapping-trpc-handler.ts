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

        // TODO: This handler needs to be rewritten for the new metadata approach
        // which doesn't support per-channel configuration mappings
        throw new TRPCError({
          code: "NOT_IMPLEMENTED",
          message: "Channel mapping is not supported in the current metadata approach",
        });
      });
  }
}
