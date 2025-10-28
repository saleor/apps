import { TRPCError } from "@trpc/server";
import { publicProcedure } from "@/modules/trpc/public-procedure";
import { getPool } from "@/lib/database";
import { GlobalPayPalConfigRepository } from "../global-paypal-config-repository";
import { setGlobalConfigInputSchema } from "./wsm-admin-input-schemas";
import { z } from "zod";

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
 * Set global PayPal configuration (WSM admin only)
 */
export class SetGlobalConfigHandler {
  baseProcedure = publicProcedure;

  getTrpcProcedure() {
    return this.baseProcedure.input(setGlobalConfigInputSchema).mutation(async ({ input }: { input: z.infer<typeof setGlobalConfigInputSchema> }) => {
      // Validate super admin authentication
      validateSuperAdminKey(input.secretKey);

      const repository = GlobalPayPalConfigRepository.create(getPool());

      const configResult = await repository.upsertConfig({
        clientId: input.clientId,
        clientSecret: input.clientSecret,
        environment: input.environment,
      });

      if (configResult.isErr()) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: `Failed to save configuration: ${configResult.error.message}`,
        });
      }

      const config = configResult.value;

      return {
        success: true,
        message: "Global PayPal configuration saved successfully",
        config: {
          id: config.id,
          environment: config.environment,
          createdAt: config.createdAt,
        },
      };
    });
  }
}
