import { captureException } from "@sentry/nextjs";
import { TRPCError } from "@trpc/server";

import { BaseError } from "@/lib/errors";
import { RandomId } from "@/lib/random-id";
import { StripeConfig } from "@/modules/app-config/stripe-config";
import { newStripeConfigInputSchema } from "@/modules/app-config/trpc-handlers/new-stripe-config-input-schema";
import { createSaleorApiUrl } from "@/modules/saleor/saleor-api-url";
import { StripeWebhookSecret } from "@/modules/stripe/stripe-webhook-secret";
import { protectedClientProcedure } from "@/modules/trpc/protected-client-procedure";

/**
 * todo
 * - test
 * - webhook should be created here
 */
export class NewStripeConfigTrpcHandler {
  baseProcedure = protectedClientProcedure;

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

      const newConfig = StripeConfig.create({
        publishableKey: input.publishableKey,
        restrictedKey: input.restrictedKey,
        name: input.name,
        id: new RandomId().generate(),
        webhookSecret: StripeWebhookSecret.create("whsec_TODO")._unsafeUnwrap(), //todo - pass after webhook is created
      });

      // TODO: Handle exact reasons, give good messages
      if (newConfig.isErr()) {
        captureException(
          new BaseError(
            "Handler validation triggered outside of input validation. This means input validation is leaky.",
          ),
        );
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Failed to create Stripe configuration. Data is invalid",
        });
      }

      const saveResult = await ctx.configRepo.saveStripeConfig({
        config: newConfig.value,
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
