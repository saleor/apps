import { Client, cacheExchange, fetchExchange } from "urql";

export const createGraphQLClient = (saleorApiUrl: string, token: string) => {
  return new Client({
    url: saleorApiUrl,
    exchanges: [cacheExchange, fetchExchange],
    fetchOptions: {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  });
};

// Alias for compatibility
export const createInstrumentedGraphqlClient = createGraphQLClient;
