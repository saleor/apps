import { captureException } from "@sentry/nextjs";
import { TRPCError } from "@trpc/server";
import { z } from "zod";

import { BaseError } from "@/lib/errors";
import { createSaleorApiUrl } from "@/modules/saleor/saleor-api-url";
import { StripeWebhookManager } from "@/modules/stripe/stripe-webhook-manager";
import { protectedClientProcedure } from "@/modules/trpc/protected-client-procedure";

// todo test
export class RemoveStripeConfigTrpcHandler {
  baseProcedure = protectedClientProcedure;
  private readonly webhookManager = new StripeWebhookManager();

  constructor(deps: { webhookManager: StripeWebhookManager }) {
    this.webhookManager = deps.webhookManager;
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

        const config = await ctx.configRepo.getStripeConfig({
          configId: input.configId,
          saleorApiUrl: saleorApiUrl.value,
          appId: ctx.appId,
        });

        if (config.isErr()) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to remove Stripe configuration. Please try again.",
          });
        }

        if (config.value === null) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Config not found, please refresh the page and try again.",
          });
        }

        const webhookRemovingResult = await this.webhookManager.removeWebhook(config.value);

        if (webhookRemovingResult.isErr()) {
          captureException(webhookRemovingResult.error);
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to remove Stripe webhook. Please try again.",
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
