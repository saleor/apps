import { TRPCError } from "@trpc/server";
import { middleware } from "../server";
import { saleorApp } from "@/saleor-app";

/**
 * Perform APL token retrieval in middleware, required by every handler that connects to Saleor
 */
export const attachAppToken = middleware(async ({ ctx, next }) => {
  if (!ctx.saleorApiUrl) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "Missing saleorApiUrl in request",
    });
  }

  const authData = await saleorApp.apl.get(ctx.saleorApiUrl);

  if (!authData?.token) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "Missing auth data",
    });
  }

  return next({
    ctx: {
      authData,
      // TODO: Remove appToken
      appToken: authData.token,
    },
  });
});
