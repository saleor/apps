import { captureException } from "@sentry/nextjs";
import { TRPCError } from "@trpc/server";

import { BaseError } from "@/lib/errors";
import { RandomId } from "@/lib/random-id";
import { PayPalConfig } from "@/modules/app-config/domain/paypal-config";
import { newPayPalConfigInputSchema } from "@/modules/app-config/trpc-handlers/new-paypal-config-input-schema";
import { createSaleorApiUrl } from "@/modules/saleor/saleor-api-url";
import { PayPalAuthValidator } from "@/modules/paypal/paypal-auth-validator";
import { PayPalClient } from "@/modules/paypal/paypal-client";
import { PayPalClientSecret } from "@/modules/paypal/paypal-restricted-key";
import { PayPalWebhookManager } from "@/modules/paypal/paypal-webhook-manager";
import { createPayPalWebhookSecret } from "@/modules/paypal/paypal-webhook-secret";
import { protectedClientProcedure } from "@/modules/trpc/protected-client-procedure";

export class NewPayPalConfigTrpcHandler {
  baseProcedure = protectedClientProcedure;
  private readonly webhookManager = new PayPalWebhookManager();

  constructor(deps: { webhookManager: PayPalWebhookManager }) {
    this.webhookManager = deps.webhookManager;
  }

  private validateRk(rk: PayPalClientSecret) {
    const validator = PayPalAuthValidator.createFromClient(
      PayPalClient.createFromClientSecret(rk),
    );

    return validator.validatePayPalAuth();
  }

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

      const configId = new RandomId().generate();

      /**
       * Create model just to validate
       */
      const configValidation = PayPalConfig.create({
        clientId: input.clientId,
        clientSecret: input.clientSecret,
        name: input.name,
        id: configId,
        /**
         * Is passed later after webhook is created
         * If we find this not elegant, we need to create "Partial" config model + final config model
         * Or move validation to separate logic
         */
        webhookSecret: createPayPalWebhookSecret("whsec_TODO")._unsafeUnwrap(),
        webhookId: "wh_TODO",
      });

      // TODO: Handle exact reasons, give good messages
      if (configValidation.isErr()) {
        captureException(
          new BaseError(
            "Handler validation triggered outside of input validation. This means input validation is leaky.",
          ),
        );
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: `Failed to create PayPal configuration: ${configValidation.error.message}`,
        });
      }

      const rkValidationResult = await this.validateRk(input.clientSecret);

      if (rkValidationResult.isErr()) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Failed to create PayPal configuration. Restricted key is invalid",
        });
      }

      const webhookCreationResult = await this.webhookManager.createWebhook(
        {
          name: configValidation.value.name,
          clientSecret: configValidation.value.clientSecret,
          clientId: configValidation.value.clientId,
          configurationId: configId,
        },
        {
          saleorApiUrl: saleorApiUrl.value,
          appUrl: ctx.appUrl,
          appId: ctx.appId,
        },
      );

      if (webhookCreationResult.isErr()) {
        // todo map errors
        throw new TRPCError({
          code: "BAD_REQUEST",
          message:
            "Failed to create PayPal webhook. Please validate your credentials or contact support.",
        });
      }

      const { secret: rawPayPalWebhookSecret, id: paypalWebhookId } = webhookCreationResult.value;

      const paypalWebhookSecretVo = createPayPalWebhookSecret(rawPayPalWebhookSecret);

      if (paypalWebhookSecretVo.isErr()) {
        captureException(
          new BaseError("Secret from PayPal doesnt match expected format", {
            cause: paypalWebhookSecretVo.error,
          }),
        );

        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to create PayPal webhook. Secret is invalid. Please contact support.",
        });
      }

      const configToSave = PayPalConfig.create({
        name: configValidation.value.name,
        clientSecret: configValidation.value.clientSecret,
        clientId: configValidation.value.clientId,
        id: configId,
        webhookSecret: paypalWebhookSecretVo.value,
        webhookId: paypalWebhookId,
      });

      if (configToSave.isErr()) {
        captureException(
          new BaseError("Failed to create PayPal configuration. This should not happen", {
            cause: configToSave.error,
          }),
        );

        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to create PayPal configuration. Please contact support.",
        });
      }

      const saveResult = await ctx.configRepo.savePayPalConfig({
        config: configToSave.value,
        saleorApiUrl: saleorApiUrl.value,
        appId: ctx.appId,
      });

      if (saveResult.isErr()) {
        captureException(saveResult.error);

        // TODO Handle exact errors
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to create PayPal configuration. Data can't be saved.",
        });
      }
    });
  }
}
