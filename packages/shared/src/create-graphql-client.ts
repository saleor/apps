import { authExchange } from "@urql/exchange-auth";
import { cacheExchange, createClient as urqlCreateClient, fetchExchange, Exchange } from "urql";

export interface CreateGraphQLClientArgs {
  saleorApiUrl: string;
  token?: string;
  opts?: {
    prependingFetchExchanges?: Exchange[];
  };
}

/*
 * Creates instance of urql client with optional auth exchange (if token is provided).
 * Accessing public parts of the Saleor API is possible without providing access token.
 * When trying to access fields or operations protected by permissions.
 * Token can be obtained:
 * - by accessing token from appBridge https://github.com/saleor/saleor-app-sdk/blob/main/docs/app-bridge.md
 * - by using token created during the app registration, saved in the APL https://github.com/saleor/saleor-app-sdk/blob/main/docs/apl.md
 * - by token create mutation https://docs.saleor.io/docs/3.x/api-usage/authentication
 *
 * In the context of developing Apps, the two first options are recommended.
 */
export const createGraphQLClient = ({ saleorApiUrl, token, opts }: CreateGraphQLClientArgs) => {
  const beforeFetch = [];

  if (opts?.prependingFetchExchanges) {
    beforeFetch.push(...opts?.prependingFetchExchanges);
  }

  return urqlCreateClient({
    url: saleorApiUrl,
    exchanges: [
      cacheExchange,
      authExchange(async (utils) => {
        return {
          addAuthToOperation(operation) {
            const headers: Record<string, string> = token
              ? {
                  "Authorization-Bearer": token,
                }
              : {};

            return utils.appendHeaders(operation, headers);
          },
          didAuthError(error) {
            return error.graphQLErrors.some((e) => e.extensions?.code === "FORBIDDEN");
          },
          async refreshAuth() {},
        };
      }),
      ...beforeFetch,
      fetchExchange,
    ],
  });
};
