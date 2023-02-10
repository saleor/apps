import { initUrqlClient } from "next-urql";
import { AuthConfig, authExchange } from "@urql/exchange-auth";
import {
  cacheExchange,
  createClient as urqlCreateClient,
  dedupExchange,
  fetchExchange,
  ssrExchange,
} from "urql";

interface IAuthState {
  token: string;
}

const getExchanges = (getAuth: AuthConfig<IAuthState>["getAuth"]) => [
  dedupExchange,
  cacheExchange,
  authExchange<IAuthState>({
    addAuthToOperation: ({ authState, operation }) => {
      if (!authState || !authState?.token) {
        return operation;
      }

      const fetchOptions =
        typeof operation.context.fetchOptions === "function"
          ? operation.context.fetchOptions()
          : operation.context.fetchOptions || {};

      return {
        ...operation,
        context: {
          ...operation.context,
          fetchOptions: {
            ...fetchOptions,
            headers: {
              ...fetchOptions.headers,
              "Authorization-Bearer": authState.token,
            },
          },
        },
      };
    },
    getAuth,
  }),
  fetchExchange,
];

export const nextClient = (url: string, getAuth: AuthConfig<IAuthState>["getAuth"]) => {
  return initUrqlClient(
    {
      url,
      exchanges: getExchanges(getAuth),
    },
    false
  );
};

export const createClient = (url: string, getAuth: AuthConfig<IAuthState>["getAuth"]) =>
  urqlCreateClient({
    url,
    exchanges: getExchanges(getAuth),
  });
