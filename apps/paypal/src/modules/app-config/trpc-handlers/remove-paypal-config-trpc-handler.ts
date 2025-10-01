import { captureException } from "@sentry/nextjs";
import { TRPCError } from "@trpc/server";
import { z } from "zod";

import { createSaleorApiUrl } from "@/modules/saleor/saleor-api-url";
import { protectedClientProcedure } from "@/modules/trpc/protected-client-procedure";

export class RemovePayPalConfigTrpcHandler {
  baseProcedure = protectedClientProcedure;

  getTrpcProcedure() {
    return this.baseProcedure
      .input(z.object({ configId: z.string() }))
      .mutation(async ({ input, ctx }) => {
        const saleorApiUrl = createSaleorApiUrl(ctx.saleorApiUrl);

        if (saleorApiUrl.isErr()) {
          throw new TRPCError({ code: "BAD_REQUEST", message: "Malformed request" });
        }

        const deleteResult = await ctx.configRepo.deletePayPalConfig(
          { saleorApiUrl: saleorApiUrl.value, appId: ctx.appId },
          { configId: input.configId },
        );

        if (deleteResult.isErr()) {
          captureException(deleteResult.error);
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to remove configuration.",
          });
        }
      });
  }
}
