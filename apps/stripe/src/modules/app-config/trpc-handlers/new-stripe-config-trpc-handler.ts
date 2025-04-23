import { captureException } from "@sentry/nextjs";
import { TRPCError } from "@trpc/server";

import { BaseError } from "@/lib/errors";
import { RandomId } from "@/lib/random-id";
import { StripeConfig } from "@/modules/app-config/stripe-config";
import { newStripeConfigInputSchema } from "@/modules/app-config/trpc-handlers/new-stripe-config-input-schema";
import { createSaleorApiUrl } from "@/modules/saleor/saleor-api-url";
import { StripeAuthValidator } from "@/modules/stripe/stripe-auth-validator";
import { StripeClient } from "@/modules/stripe/stripe-client";
import { StripeRestrictedKey } from "@/modules/stripe/stripe-restricted-key";
import { StripeWebhookManager } from "@/modules/stripe/stripe-webhook-manager";
import { createStripeWebhookSecret } from "@/modules/stripe/stripe-webhook-secret";
import { protectedClientProcedure } from "@/modules/trpc/protected-client-procedure";

export class NewStripeConfigTrpcHandler {
  baseProcedure = protectedClientProcedure;
  private readonly webhookManager = new StripeWebhookManager();

  constructor(deps: { webhookManager: StripeWebhookManager }) {
    this.webhookManager = deps.webhookManager;
  }

  private validateRk(rk: StripeRestrictedKey) {
    const validator = StripeAuthValidator.createFromClient(
      StripeClient.createFromRestrictedKey(rk),
    );

    return validator.validateStripeAuth();
  }

  getTrpcProcedure() {
    return this.baseProcedure.input(newStripeConfigInputSchema).mutation(async ({ input, ctx }) => {
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
      const configValidation = StripeConfig.create({
        publishableKey: input.publishableKey,
        restrictedKey: input.restrictedKey,
        name: input.name,
        id: configId,
        /**
         * Is passed later after webhook is created
         * If we find this not elegant, we need to create "Partial" config model + final config model
         * Or move validation to separate logic
         */
        webhookSecret: createStripeWebhookSecret("whsec_TODO")._unsafeUnwrap(),
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
          message: `Failed to create Stripe configuration: ${configValidation.error.message}`,
        });
      }

      const rkValidationResult = await this.validateRk(input.restrictedKey);

      if (rkValidationResult.isErr()) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Failed to create Stripe configuration. Restricted key is invalid",
        });
      }

      const webhookCreationResult = await this.webhookManager.createWebhook(
        {
          name: configValidation.value.name,
          restrictedKey: configValidation.value.restrictedKey,
          publishableKey: configValidation.value.publishableKey,
          configurationId: configId,
        },
        {
          saleorApiUrl: saleorApiUrl.value,
          appUrl: ctx.appUrl,
        },
      );

      if (webhookCreationResult.isErr()) {
        // todo map errors
        throw new TRPCError({
          code: "BAD_REQUEST",
          message:
            "Failed to create Stripe webhook. Please validate your credentials or contact support.",
        });
      }

      const { secret: rawStripeWebhookSecret, id: stripeWebhookId } = webhookCreationResult.value;

      const stripeWebhookSecretVo = createStripeWebhookSecret(rawStripeWebhookSecret);

      if (stripeWebhookSecretVo.isErr()) {
        captureException(
          new BaseError("Secret from Stripe doesnt match expected format", {
            cause: stripeWebhookSecretVo.error,
          }),
        );

        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to create Stripe webhook. Secret is invalid. Please contact support.",
        });
      }

      const configToSave = StripeConfig.create({
        name: configValidation.value.name,
        restrictedKey: configValidation.value.restrictedKey,
        publishableKey: configValidation.value.publishableKey,
        id: configId,
        webhookSecret: stripeWebhookSecretVo.value,
        webhookId: stripeWebhookId,
      });

      if (configToSave.isErr()) {
        captureException(
          new BaseError("Failed to create Stripe configuration. This should not happen", {
            cause: configToSave.error,
          }),
        );

        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to create Stripe configuration. Please contact support.",
        });
      }

      const saveResult = await ctx.configRepo.saveStripeConfig({
        config: configToSave.value,
        saleorApiUrl: saleorApiUrl.value,
        appId: ctx.appId,
      });

      if (saveResult.isErr()) {
        // TODO Handle exact errors
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to create Stripe configuration. Data can't be saved.",
        });
      }
    });
  }
}
