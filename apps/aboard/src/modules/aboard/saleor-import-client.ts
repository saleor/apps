import { createGraphQLClient } from "@saleor/apps-shared/create-graphql-client";
import { BaseError } from "@saleor/errors";
import { err, ok, type Result } from "neverthrow";
import {
  type AnyVariables,
  type OperationContext,
  type OperationResult,
  type TypedDocumentNode,
} from "urql";

import { fetchWithTimeout } from "./fetch-with-timeout";

export const SaleorImportClientError = {
  RequestError: BaseError.subclass("SaleorImportClient.RequestError", {
    props: { _brand: "SaleorImportClient.RequestError" as const },
  }),
  SessionChangedError: BaseError.subclass("SaleorImportClient.SessionChangedError", {
    props: { _brand: "SaleorImportClient.SessionChangedError" as const },
  }),
};

export type SaleorImportClientError = InstanceType<
  typeof SaleorImportClientError.RequestError | typeof SaleorImportClientError.SessionChangedError
>;

type Execute = <TData, TVariables extends AnyVariables>(
  document: TypedDocumentNode<TData, TVariables>,
  variables: TVariables,
) => Promise<Result<TData, SaleorImportClientError>>;

export type SaleorImportClient = {
  query: Execute;
  mutation: Execute;
};

/**
 * The message already carries the GraphQL or network error text, so the urql error isn't passed
 * as `cause`: modern-errors would prepend "CombinedError: ..." to what Dashboard shows the user.
 */
const toResult = <TData>(
  result: OperationResult<TData>,
): Result<TData, SaleorImportClientError> => {
  if (result.error || !result.data) {
    return err(
      new SaleorImportClientError.RequestError(
        result.error?.graphQLErrors.map((error) => error.message).join("; ") ||
          result.error?.networkError?.message ||
          "Saleor returned an empty response.",
      ),
    );
  }

  return ok(result.data);
};

/**
 * Imports run for minutes, so the token is read before every request. When Dashboard switches
 * to another Saleor instance or drops the session, `getToken` returns undefined and the import
 * stops instead of writing with stale credentials.
 */
export const createSaleorImportClient = ({
  saleorApiUrl,
  getToken,
  signal,
}: {
  saleorApiUrl: string;
  getToken: () => string | undefined;
  signal?: AbortSignal;
}): SaleorImportClient => {
  let token: string | undefined;
  const client = createGraphQLClient({ saleorApiUrl, token: () => token });
  const context: Partial<OperationContext> = {
    requestPolicy: "network-only",
    preferGetMethod: false,
    fetch: (input, init) =>
      fetchWithTimeout(input, { ...init, signal: signal ?? init?.signal }, { service: "Saleor" }),
  };

  const refreshToken = (): Result<void, SaleorImportClientError> => {
    token = getToken();

    return token
      ? ok(undefined)
      : err(
          new SaleorImportClientError.SessionChangedError(
            "Saleor session changed. Reopen Aboard and preview the catalog again.",
          ),
        );
  };

  return {
    query: async (document, variables) => {
      const session = refreshToken();

      if (session.isErr()) {
        return err(session.error);
      }

      return toResult(await client.query(document, variables, context).toPromise());
    },
    mutation: async (document, variables) => {
      const session = refreshToken();

      if (session.isErr()) {
        return err(session.error);
      }

      return toResult(await client.mutation(document, variables, context).toPromise());
    },
  };
};
