import { captureException } from "@sentry/nextjs";
import { TRPCError } from "@trpc/server";
import { Result } from "neverthrow";
import { z } from "zod";

import { BaseError } from "@/lib/errors";
import { AppConfigRepo } from "@/modules/app-config/repositories/app-config-repo";
import { createSaleorApiUrl, SaleorApiUrl } from "@/modules/saleor/saleor-api-url";
import { StripeWebhookManager } from "@/modules/stripe/stripe-webhook-manager";
import { protectedClientProcedure } from "@/modules/trpc/protected-client-procedure";

// todo test
export class RemoveStripeConfigTrpcHandler {
  baseProcedure = protectedClientProcedure;

  private readonly webhookManager = new StripeWebhookManager();

  constructor(deps: { webhookManager: StripeWebhookManager }) {
    this.webhookManager = deps.webhookManager;
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
    const rootConfig = await configRepo.getRootConfig({
      saleorApiUrl: saleorApiUrl,
      appId: appId,
    });

    if (rootConfig.isErr()) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to remove Stripe configuration. Please try again.",
      });
    }

    if (rootConfig.value === null) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Config not found, please refresh the page and try again.",
      });
    }

    return rootConfig.value;
  }

  getTrpcProcedure() {
    return this.baseProcedure
      .input(
        z.object({
          configId: z.string().uuid(),
        }),
      )
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

        const configToRemove = rootConfig.stripeConfigsById[input.configId];
        const channelsToUnbind = rootConfig.getChannelsBoundToGivenConfig(input.configId);

        if (!configToRemove) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Config not found, please refresh the page and try again.",
          });
        }

        const webhookRemovingResult = await this.webhookManager.removeWebhook(configToRemove);

        if (webhookRemovingResult.isErr()) {
          /**
           * Ignore - it's possible webhook was removed in Stripe, or in previous call. We can't transactional remove both webhook and our config,
           * so we must accept that inconsistency and document it
           */
        }

        /**
         * TODO: To make it more reliable, we can use transact writes in DynamoDB, but even if this partially fails,
         * next operations should fix invalid state
         */
        const unbindingResults = Result.combine(
          await Promise.all(
            channelsToUnbind.map((id) =>
              ctx.configRepo.updateMapping(
                {
                  saleorApiUrl: saleorApiUrl.value,
                  appId: ctx.appId,
                },
                {
                  configId: null,
                  channelId: id,
                },
              ),
            ),
          ),
        );

        if (unbindingResults.isErr()) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to update channel config mapping. Please try again.",
          });
        }

        const removalResult = await ctx.configRepo.removeConfig(
          {
            saleorApiUrl: saleorApiUrl.value,
            appId: ctx.appId,
          },
          {
            configId: input.configId,
          },
        );

        if (removalResult.isErr()) {
          captureException(removalResult.error);

          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to remove Stripe configuration. Please try again.",
          });
        }
      });
  }
}
