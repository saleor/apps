import { MiddlewareFunction, TRPCError } from "@trpc/server";
import { middleware, procedure } from "../server";
import { attachAppToken } from "../middleware/attach-app-token";
import { createClient } from "@/lib/create-graphql-client";
import { invariant } from "@/lib/invariant";

/**
 * Construct common graphQL client and attach it to the context
 */
export const procedureWithGraphqlClient = procedure
  .use(attachAppToken)
  .use(async ({ ctx, next }) => {
    invariant(ctx.saleorApiUrl);
    const client = createClient(ctx.saleorApiUrl, async () =>
      Promise.resolve({ token: ctx.appToken })
    );

    return next({
      ctx: {
        apiClient: client,
      },
    });
  });
