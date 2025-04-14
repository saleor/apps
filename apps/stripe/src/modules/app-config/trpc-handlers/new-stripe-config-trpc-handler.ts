import { captureException } from "@sentry/nextjs";
import { TRPCError } from "@trpc/server";
import { z } from "zod";

import { BaseError } from "@/lib/errors";
import { RandomId } from "@/lib/random-id";
import { StripeConfig } from "@/modules/app-config/stripe-config";
import { SaleorApiUrl } from "@/modules/saleor/saleor-api-url";
import { StripePublishableKey } from "@/modules/stripe/stripe-publishable-key";
import { StripeRestrictedKey } from "@/modules/stripe/stripe-restricted-key";
import { StripeWebhookSecret } from "@/modules/stripe/stripe-webhook-secret";
import { protectedClientProcedure } from "@/modules/trpc/protected-client-procedure";

export const newStripeConfigSchema = z.object({
  name: z.string().min(1),
  channelId: z.string().min(1),
  publishableKey: z.string().transform((value, ctx): StripePublishableKey => {
    return StripePublishableKey.create({
      publishableKey: value,
    }).match(
      (parsed) => parsed,
      () => {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Invalid Publishable Key format, it should start with pk_live_ or pk_test_",
        });

        return z.NEVER;
      },
    );
  }),
  restrictedKey: z.string().transform((value, ctx): StripeRestrictedKey => {
    return StripeRestrictedKey.create({
      restrictedKey: value,
    }).match(
      (parsed) => parsed,
      () => {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Invalid Restricted Key format, it should start with rk_test_ or rk_live_",
        });

        return z.NEVER;
      },
    );
  }),
});

/**
 * todo
 * - test
 * - webhook should be created here
 */
export class NewStripeConfigTrpcHandler {
  baseProcedure = protectedClientProcedure;

  getTrpcProcedure() {
    return this.baseProcedure.input(newStripeConfigSchema).mutation(async ({ input, ctx }) => {
      const saleorApiUrl = SaleorApiUrl.create({ url: ctx.saleorApiUrl });

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
        channelId: input.channelId,
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
