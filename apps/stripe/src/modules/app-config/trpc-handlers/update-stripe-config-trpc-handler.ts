import { captureException } from "@sentry/nextjs";
import { TRPCError } from "@trpc/server";
import { after } from "next/server";

import { BaseError } from "@/lib/errors";
import { createInstrumentedGraphqlClient } from "@/lib/graphql-client";
import { StripeConfig } from "@/modules/app-config/domain/stripe-config";
import { type AppConfigRepo } from "@/modules/app-config/repositories/app-config-repo";
import { stripeKeyEnv } from "@/modules/app-config/trpc-handlers/stripe-key-input-schemas";
import { updateStripeConfigInputSchema } from "@/modules/app-config/trpc-handlers/update-stripe-config-input-schema";
import { StripeProblemReporter } from "@/modules/app-problems/stripe-problem-reporter";
import { createSaleorApiUrl, type SaleorApiUrl } from "@/modules/saleor/saleor-api-url";
import { StripeAuthValidator } from "@/modules/stripe/stripe-auth-validator";
import { StripeClient } from "@/modules/stripe/stripe-client";
import { type StripeRestrictedKey } from "@/modules/stripe/stripe-restricted-key";
import { type StripeWebhookManager } from "@/modules/stripe/stripe-webhook-manager";
import { createStripeWebhookSecret } from "@/modules/stripe/stripe-webhook-secret";
import { protectedClientProcedure } from "@/modules/trpc/protected-client-procedure";

export class UpdateStripeConfigTrpcHandler {
  baseProcedure = protectedClientProcedure;

  private readonly webhookManager: StripeWebhookManager;

  constructor(deps: { webhookManager: StripeWebhookManager }) {
    this.webhookManager = deps.webhookManager;
  }

  private validateRk(rk: StripeRestrictedKey) {
    const validator = StripeAuthValidator.createFromClient(
      StripeClient.createFromRestrictedKey(rk),
    );

    return validator.validateStripeAuth();
  }

  private async getRootConfigOrThrow({
    configRepo,
    appId,
    saleorApiUrl,
  }: {
    configRepo: AppConfigRepo;
    saleorApiUrl: SaleorApiUrl;
    appId: string;
  }) {
    const rootConfig = await configRepo.getRootConfig({ saleorApiUrl, appId });

    if (rootConfig.isErr()) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to update Stripe configuration. Please try again.",
      });
    }

    return rootConfig.value;
  }

  getTrpcProcedure() {
    return this.baseProcedure
      .input(updateStripeConfigInputSchema)
      .mutation(async ({ input, ctx }) => {
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

        const rootConfig = await this.getRootConfigOrThrow({
          configRepo: ctx.configRepo,
          appId: ctx.appId,
          saleorApiUrl: saleorApiUrl.value,
        });

        const existingConfig = rootConfig.stripeConfigsById[input.configId];

        if (!existingConfig) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Config not found, please refresh the page and try again.",
          });
        }

        /** Empty restricted key input means "keep the one already stored". */
        const restrictedKey = input.restrictedKey ?? existingConfig.restrictedKey;

        if (stripeKeyEnv(input.publishableKey) !== stripeKeyEnv(restrictedKey)) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message:
              "Publishable key belongs to a different environment than the saved restricted key. To switch between sandbox and live, provide both keys.",
          });
        }

        const keysChanged =
          restrictedKey !== existingConfig.restrictedKey ||
          input.publishableKey !== existingConfig.publishableKey;

        let webhookId = existingConfig.webhookId;
        let webhookSecret = existingConfig.webhookSecret;

        if (keysChanged) {
          const rkValidationResult = await this.validateRk(restrictedKey);

          if (rkValidationResult.isErr()) {
            throw new TRPCError({
              code: "UNAUTHORIZED",
              message: "Failed to update Stripe configuration. Restricted key is invalid",
            });
          }

          const webhookReachable = await this.webhookManager.isWebhookReachableWithKey({
            webhookId: existingConfig.webhookId,
            restrictedKey,
          });

          if (webhookReachable.isErr()) {
            throw new TRPCError({
              code: "BAD_REQUEST",
              message:
                "Couldn't verify the existing Stripe webhook with the new key. Ensure the key can read and write webhook endpoints, then try again.",
            });
          }

          /**
           * The stored webhook lives on the Stripe account the previous key pointed to. If the new
           * key cannot see it, the configuration needs its own webhook on the new account.
           */
          if (!webhookReachable.value) {
            const webhookCreationResult = await this.webhookManager.createWebhook(
              {
                name: input.name,
                restrictedKey,
                publishableKey: input.publishableKey,
                configurationId: input.configId,
              },
              {
                saleorApiUrl: saleorApiUrl.value,
                appUrl: ctx.appUrl,
                appId: ctx.appId,
              },
            );

            if (webhookCreationResult.isErr()) {
              throw new TRPCError({
                code: "BAD_REQUEST",
                message:
                  "Failed to create Stripe webhook. Please validate your credentials or contact support.",
              });
            }

            const newWebhookSecret = createStripeWebhookSecret(webhookCreationResult.value.secret);

            if (newWebhookSecret.isErr()) {
              captureException(
                new BaseError("Secret from Stripe doesnt match expected format", {
                  cause: newWebhookSecret.error,
                }),
              );

              throw new TRPCError({
                code: "INTERNAL_SERVER_ERROR",
                message:
                  "Failed to create Stripe webhook. Secret is invalid. Please contact support.",
              });
            }

            webhookId = webhookCreationResult.value.id;
            webhookSecret = newWebhookSecret.value;

            /**
             * Leftover endpoint on the previous account. Removal can fail (revoked key, webhook
             * already gone) and that must not fail the update - same trade-off as removing a config.
             */
            await this.webhookManager.removeWebhook({
              webhookId: existingConfig.webhookId,
              restrictedKey: existingConfig.restrictedKey,
            });
          }
        }

        const configToSave = StripeConfig.create({
          id: existingConfig.id,
          name: input.name,
          publishableKey: input.publishableKey,
          restrictedKey,
          webhookId,
          webhookSecret,
        });

        if (configToSave.isErr()) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: `Failed to update Stripe configuration: ${configToSave.error.message}`,
          });
        }

        const saveResult = await ctx.configRepo.saveStripeConfig({
          config: configToSave.value,
          saleorApiUrl: saleorApiUrl.value,
          appId: ctx.appId,
        });

        if (saveResult.isErr()) {
          captureException(saveResult.error);

          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to update Stripe configuration. Data can't be saved.",
          });
        }

        /** Keeps the endpoint recognizable in the Stripe dashboard. Cosmetic, so failures are ignored. */
        if (input.name !== existingConfig.name) {
          after(() =>
            this.webhookManager.updateWebhookDescription({
              webhookId,
              restrictedKey,
              configName: input.name,
            }),
          );
        }

        /**
         * New credentials supersede whatever auth or signature problem was reported for this
         * configuration - the Dashboard should stop showing it.
         */
        if (keysChanged) {
          const reporter = new StripeProblemReporter(
            createInstrumentedGraphqlClient({
              saleorApiUrl: ctx.saleorApiUrl,
              token: ctx.appToken,
            }),
          );

          after(() => reporter.clearProblemsForConfig(input.configId));
        }
      });
  }
}
