import { cacheExchange, Client, fetchExchange } from "urql";

export const createGraphqlClient = ({
  saleorApiUrl,
  token,
}: {
  saleorApiUrl: string;
  token: string;
}) =>
  new Client({
    url: saleorApiUrl,
    exchanges: [cacheExchange, fetchExchange],
    fetchOptions: {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  });
