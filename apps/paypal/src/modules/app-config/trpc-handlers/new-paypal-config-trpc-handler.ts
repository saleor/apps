import { captureException } from "@sentry/nextjs";
import { TRPCError } from "@trpc/server";

import { BaseError } from "@/lib/errors";
import { randomId } from "@/lib/random-id";
import { PayPalConfig } from "@/modules/app-config/domain/paypal-config";
import { newPayPalConfigInputSchema } from "@/modules/app-config/trpc-handlers/new-paypal-config-input-schema";
import { createSaleorApiUrl } from "@/modules/saleor/saleor-api-url";
import { protectedClientProcedure } from "@/modules/trpc/protected-client-procedure";

export class NewPayPalConfigTrpcHandler {
  baseProcedure = protectedClientProcedure;

  getTrpcProcedure() {
    return this.baseProcedure.input(newPayPalConfigInputSchema).mutation(async ({ input, ctx }) => {
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

      const configId = randomId();

      const configValidation = PayPalConfig.create({
        clientId: input.clientId,
        clientSecret: input.clientSecret,
        name: input.name,
        id: configId,
        environment: input.environment,
      });

      if (configValidation.isErr()) {
        captureException(configValidation.error);
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: `Failed to create PayPal configuration: ${configValidation.error.message}`,
        });
      }

      const saveResult = await ctx.configRepo.savePayPalConfig(
        {
          saleorApiUrl: saleorApiUrl.value,
          appId: ctx.appId,
        },
        configValidation.value,
      );

      if (saveResult.isErr()) {
        captureException(saveResult.error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to save PayPal configuration.",
        });
      }

      return { success: true };
    });
  }
}
