import { TypedDocumentNode } from "@graphql-typed-document-node/core";
import { APIRequestContext } from "@playwright/test";
import { print } from "graphql";

export async function callSaleorGraphqlApi<TResult, TVariables>(
  request: APIRequestContext,
  ast: TypedDocumentNode<TResult, TVariables>,
  ...[variables]: TVariables extends Record<string, never> ? [] : [TVariables]
): Promise<{ data: TResult }> {
  const response = await request.post("https://ext-team-latest-e2e.staging.saleor.cloud/graphql/", {
    data: {
      query: print(ast),
      variables,
    },
  });

  return response.json() as Promise<{ data: TResult }>;
}
