import { useAppBridge } from "@saleor/app-sdk/app-bridge";
import { PropsWithChildren } from "react";
import { cacheExchange, createClient as urqlCreateClient, fetchExchange, Provider } from "urql";
import { authExchange } from "@urql/exchange-auth";

const createGraphQLClient = ({
  graphql,
  saleorApiUrl,
  token,
}: {
  graphql: string;
  saleorApiUrl: string;
  token: string;
}) => {
  return urqlCreateClient({
    url: graphql,
    exchanges: [
      cacheExchange,
      authExchange(async (utils) => {
        return {
          addAuthToOperation(operation) {
            const headers: Record<string, string> = token
              ? {
                  "Authorization-Bearer": token,
                  "Saleor-Api-Url": saleorApiUrl,
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
      fetchExchange,
    ],
  });
};

export function GraphQLProvider(props: PropsWithChildren<{}>) {
  const { appBridgeState } = useAppBridge();
  const saleorApiUrl = appBridgeState?.saleorApiUrl!;
  const token = appBridgeState?.token!;

  const client = createGraphQLClient({
    saleorApiUrl,
    token,
    graphql: "/graphql/",
  });

  return <Provider value={client} {...props} />;
}
