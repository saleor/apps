import { captureException } from "@sentry/nextjs";
import { TRPCError } from "@trpc/server";

import { BaseError } from "@/lib/errors";
import { randomId } from "@/lib/random-id";
import { PayPalConfig } from "@/modules/app-config/domain/paypal-config";
import { createPayPalClientId, PayPalClientId } from "@/modules/paypal/paypal-client-id";
import { createPayPalClientSecret, PayPalClientSecret } from "@/modules/paypal/paypal-client-secret";
import { newPayPalConfigInputSchema } from "@/modules/app-config/trpc-handlers/new-paypal-config-input-schema";
import { createSaleorApiUrl } from "@/modules/saleor/saleor-api-url";
import { protectedClientProcedure } from "@/modules/trpc/protected-client-procedure";
import { PayPalMultiConfigMetadataManager } from "@/modules/paypal/configuration/paypal-multi-config-metadata-manager";

export class NewPayPalConfigTrpcHandler {
  baseProcedure = protectedClientProcedure;

  getTrpcProcedure() {
    return this.baseProcedure.input(newPayPalConfigInputSchema).mutation(async ({ input, ctx }) => {
      if (!ctx.saleorApiUrl) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Missing saleorApiUrl in request",
        });
      }

      if (!ctx.appId) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Missing appId in request",
        });
      }

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

      if (!ctx.appToken) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Missing app authentication token",
        });
      }

      const configId = randomId();

      console.log("Creating PayPal config with input:", { 
        name: input.name, 
        environment: input.environment,
        clientIdLength: input.clientId.length,
        clientSecretLength: input.clientSecret.length 
      });

      let clientId: PayPalClientId;
      let clientSecret: PayPalClientSecret;

      try {
        clientId = createPayPalClientId(input.clientId);
        clientSecret = createPayPalClientSecret(input.clientSecret);
        console.log("Successfully created branded types");
      } catch (error) {
        console.error("Failed to create branded types:", error);
        captureException(error instanceof Error ? error : new Error('Branded type creation failed'));
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: `Invalid PayPal credentials: ${error instanceof Error ? error.message : 'Unknown error'}`,
        });
      }

      const configValidation = PayPalConfig.create({
        clientId,
        clientSecret,
        name: input.name,
        id: configId,
        environment: input.environment,
      });

      if (configValidation.isErr()) {
        console.error("PayPal config validation failed:", configValidation.error);
        captureException(configValidation.error);
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: `Failed to create PayPal configuration: ${configValidation.error.message}`,
        });
      }

      console.log("PayPal config validation succeeded");

      const metadataManager = PayPalMultiConfigMetadataManager.createFromAuthData({
        saleorApiUrl: saleorApiUrl.value,
        token: ctx.appToken,
        appId: ctx.appId,
      });

      console.log("Attempting to save config to metadata...");
      const saveResult = await metadataManager.saveConfig(configValidation.value);

      if (saveResult.isErr()) {
        console.error("Failed to save config to metadata:", saveResult.error.message);
        captureException(saveResult.error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: `Failed to save PayPal configuration: ${saveResult.error.message}`,
        });
      }

      console.log("Successfully created PayPal config:", { id: configId, name: input.name });
      return { success: true, configId };
    });
  }
}
