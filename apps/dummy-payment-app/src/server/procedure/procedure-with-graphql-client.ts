import { createGraphQLClient } from "@saleor/apps-shared/create-graphql-client";

import { invariant } from "@/lib/invariant";

import { attachAppToken } from "../middleware/attach-app-token";
import { procedure } from "../server";

/**
 * Construct common graphQL client and attach it to the context
 */
export const procedureWithGraphqlClient = procedure
  .use(attachAppToken)
  .use(async ({ ctx, next }) => {
    invariant(ctx.saleorApiUrl);
    const client = createGraphQLClient({
      saleorApiUrl: ctx.saleorApiUrl,
      token: ctx.appToken,
    });

    return next({
      ctx: {
        apiClient: client,
      },
    });
  });
