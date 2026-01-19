import { captureException } from "@sentry/nextjs";
import { TRPCError } from "@trpc/server";

import { getPool } from "@/lib/database";
import { PayPalTenantConfigRepository } from "@/modules/app-config/repositories/paypal-tenant-config-repository";
import { createSaleorApiUrl } from "@/modules/saleor/saleor-api-url";
import { protectedClientProcedure } from "@/modules/trpc/protected-client-procedure";

export class GetTenantConfigTrpcHandler {
  baseProcedure = protectedClientProcedure;

  getTrpcProcedure() {
    return this.baseProcedure.query(async ({ ctx }) => {
      if (!ctx.saleorApiUrl || !ctx.appId || !ctx.appToken) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Missing required request parameters",
        });
      }

      const saleorApiUrl = createSaleorApiUrl(ctx.saleorApiUrl);

      if (saleorApiUrl.isErr()) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Malformed request",
        });
      }

      const repository = PayPalTenantConfigRepository.create(getPool());
      const result = await repository.getBySaleorApiUrl(saleorApiUrl.value);

      if (result.isErr()) {
        captureException(result.error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to retrieve tenant config",
        });
      }

      return {
        softDescriptor: result.value?.softDescriptor ?? undefined,
      };
    });
  }
}
