import { TRPCError } from "@trpc/server";
import { publicProcedure } from "@/modules/trpc/public-procedure";
import { getPool } from "@/lib/database";
import { GlobalPayPalConfigRepository } from "../global-paypal-config-repository";
import { wsmAdminAuthSchema } from "./wsm-admin-input-schemas";

/**
 * Validate WSM super admin secret key
 */
function validateSuperAdminKey(secretKey: string) {
  const expectedKey = process.env.SUPER_ADMIN_SECRET_KEY;

  if (!expectedKey) {
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "Super admin key not configured on server",
    });
  }

  if (secretKey !== expectedKey) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "Invalid super admin secret key",
    });
  }
}

/**
 * Get global PayPal configuration (WSM admin only)
 */
export class GetGlobalConfigHandler {
  baseProcedure = publicProcedure;

  getTrpcProcedure() {
    return this.baseProcedure.input(wsmAdminAuthSchema).query(async ({ input }: { input: { secretKey: string } }) => {
      // Validate super admin authentication
      validateSuperAdminKey(input.secretKey);

      const repository = GlobalPayPalConfigRepository.create(getPool());

      const configResult = await repository.getActiveConfig();
      if (configResult.isErr()) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to load global configuration",
        });
      }

      const config = configResult.value;

      if (!config) {
        return {
          configured: false,
          config: null,
        };
      }

      return {
        configured: true,
        config: {
          id: config.id,
          clientId: config.clientId,
          clientSecret: "***" + config.clientSecret.slice(-4), // Mask for security
          partnerMerchantId: config.partnerMerchantId,
          bnCode: config.bnCode,
          environment: config.environment,
          createdAt: config.createdAt,
          updatedAt: config.updatedAt,
        },
      };
    });
  }
}
