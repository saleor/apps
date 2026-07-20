import { TRPCError } from "@trpc/server";
import { z } from "zod";

import { env } from "@/env";
import { createLogger } from "@/logger";

import { type CheckoutLineInput, CreateCheckoutDocument } from "../../../generated/graphql";
import { procedureWithGraphqlClient } from "../procedure/procedure-with-graphql-client";
import { router } from "../server";

const checkoutLineInputSchema = z.object({
  variantId: z.string(),
  quantity: z.number().int().positive(),
  // Custom price override. Sent only when the UI enables "Custom price" for the line.
  price: z.string().optional(),
  priceOverrideReason: z.string().optional(),
});

export const checkoutRouter = router({
  /**
   * Runs `checkoutCreate` on the server so price-override operations can be logged (behind the
   * `LOG_SALEOR_OPERATIONS` env flag) and any Saleor error is forwarded to the frontend. The
   * client-side flow is used for checkouts without a price override.
   */
  create: procedureWithGraphqlClient
    .input(
      z.object({
        channelSlug: z.string(),
        variants: z.array(checkoutLineInputSchema),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const logger = createLogger("checkoutRouter.create");

      if (env.LOG_SALEOR_OPERATIONS) {
        logger.info("Running checkoutCreate against Saleor", {
          channelSlug: input.channelSlug,
          variants: input.variants,
        });
      }

      const result = await ctx.apiClient.mutation(CreateCheckoutDocument, {
        channelSlug: input.channelSlug,
        variants: input.variants as CheckoutLineInput[],
      });

      if (env.LOG_SALEOR_OPERATIONS) {
        logger.info("Received checkoutCreate result from Saleor", {
          hasError: Boolean(result.error),
          checkoutErrors: result.data?.checkoutCreate?.errors,
          checkout: result.data?.checkoutCreate?.checkout,
        });
      }

      /*
       * Network / top-level GraphQL error (e.g. missing HANDLE_CHECKOUTS permission for a price
       * override). Forwarded to the frontend as the tRPC mutation error.
       */
      if (result.error) {
        if (env.LOG_SALEOR_OPERATIONS) {
          logger.error("checkoutCreate failed with a GraphQL/network error", {
            error: result.error,
          });
        }
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: result.error.message,
          cause: result.error,
        });
      }

      // Field-level user errors are returned as data so the UI can render them inline.
      return {
        checkout: result.data?.checkoutCreate?.checkout ?? null,
        errors: result.data?.checkoutCreate?.errors ?? [],
      };
    }),
});
