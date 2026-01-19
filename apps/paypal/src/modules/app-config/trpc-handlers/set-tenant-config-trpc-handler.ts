import { captureException } from "@sentry/nextjs";
import { TRPCError } from "@trpc/server";
import { z } from "zod";

import { getPool } from "@/lib/database";
import { PayPalTenantConfigRepository } from "@/modules/app-config/repositories/paypal-tenant-config-repository";
import { createSaleorApiUrl } from "@/modules/saleor/saleor-api-url";
import { protectedClientProcedure } from "@/modules/trpc/protected-client-procedure";

const normalizeSoftDescriptor = (raw?: string) => {
  if (raw === undefined) return undefined;
  const trimmed = raw.trim();
  if (!trimmed) return undefined;
  return trimmed.slice(0, 22);
};

export class SetTenantConfigTrpcHandler {
  baseProcedure = protectedClientProcedure;

  getTrpcProcedure() {
    return this.baseProcedure
      .input(
        z.object({
          softDescriptor: z.string().optional(),
        }),
      )
      .mutation(async ({ input, ctx }) => {
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

        const normalizedSoftDescriptor = normalizeSoftDescriptor(input.softDescriptor);

        const repository = PayPalTenantConfigRepository.create(getPool());
        const result = await repository.upsert({
          saleorApiUrl: saleorApiUrl.value,
          softDescriptor: normalizedSoftDescriptor ?? null,
        });

        if (result.isErr()) {
          captureException(result.error);
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to update tenant config",
          });
        }

        return { success: true };
      });
  }
}
