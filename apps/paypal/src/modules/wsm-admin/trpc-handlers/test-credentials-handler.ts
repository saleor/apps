import { TRPCError } from "@trpc/server";
import { publicProcedure } from "@/modules/trpc/public-procedure";
import { getPool } from "@/lib/database";
import { GlobalPayPalConfigRepository } from "../global-paypal-config-repository";
import { testCredentialsInputSchema } from "./wsm-admin-input-schemas";
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
 * Test PayPal credentials (WSM admin only)
 */
export class TestCredentialsHandler {
  baseProcedure = publicProcedure;

  getTrpcProcedure() {
    return this.baseProcedure.input(testCredentialsInputSchema).mutation(async ({ input }: { input: z.infer<typeof testCredentialsInputSchema> }) => {
      // Validate super admin authentication
      validateSuperAdminKey(input.secretKey);

      const repository = GlobalPayPalConfigRepository.create(getPool());

      const testResult = await repository.testCredentials({
        clientId: input.clientId,
        clientSecret: input.clientSecret,
        environment: input.environment,
      });

      if (testResult.isErr()) {
        return {
          success: false,
          message: `Credentials are invalid: ${testResult.error.message}`,
        };
      }

      return {
        success: true,
        message: "Credentials are valid! Successfully authenticated with PayPal.",
      };
    });
  }
}
