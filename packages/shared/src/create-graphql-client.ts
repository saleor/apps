import { authExchange } from "@urql/exchange-auth";
import {
  cacheExchange,
  createClient as urqlCreateClient,
  type Exchange,
  fetchExchange,
} from "urql";

export interface CreateGraphQLClientArgs {
  saleorApiUrl: string;
  /**
   * Pass a getter when the token can change during the client's lifetime (e.g. AppBridge token refresh),
   * so the client (and its cache) can be kept.
   */
  token?: string | (() => string | undefined);
  /**
   * Identifies the calling app in Saleor's access logs. Apps should pass
   * `${packageJson.name}/${packageJson.version}`.
   *
   * Sent only server-side: Chrome ignores it and Firefox would add it to the CORS preflight.
   */
  userAgent?: string;
  opts?: {
    prependingFetchExchanges?: Exchange[];
  };
}

/*
 * Creates the instance of the urql client with optional auth exchange (if token is provided).
 * Accessing public parts of the Saleor API is possible without providing an access token.
 * When trying to access fields or operations protected by permissions.
 * Token can be obtained:
 * - by accessing token from appBridge https://docs.saleor.io/developer/extending/apps/developing-apps/app-sdk/app-bridge
 * - by using token created during the app registration, saved in the APL https://docs.saleor.io/developer/extending/apps/developing-apps/app-sdk/apl
 * - by token create mutation https://docs.saleor.io/api-usage/authentication
 *
 * In the context of developing Apps, the two first options are recommended.
 */
export const createGraphQLClient = ({
  saleorApiUrl,
  token,
  userAgent,
  opts,
}: CreateGraphQLClientArgs) => {
  const beforeFetch = [];

  if (opts?.prependingFetchExchanges) {
    beforeFetch.push(...opts?.prependingFetchExchanges);
  }

  const sendUserAgent = userAgent && typeof window === "undefined";

  return urqlCreateClient({
    url: saleorApiUrl,
    fetchOptions: sendUserAgent ? { headers: { "User-Agent": userAgent } } : undefined,
    exchanges: [
      cacheExchange,
      authExchange(async (utils) => {
        return {
          addAuthToOperation(operation) {
            const currentToken = typeof token === "function" ? token() : token;
            const headers: Record<string, string> = currentToken
              ? {
                  "Authorization-Bearer": currentToken,
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
