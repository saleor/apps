import { CreateGraphQLClientArgs } from "@saleor/apps-shared/create-graphql-client";
import { GraphQLClient } from "graphql-request";

type CreateGraphQLClientProps = Omit<CreateGraphQLClientArgs, "opts">;

// TODO: add otel exchange
export const createInstrumentedGraphqlClient = (props: CreateGraphQLClientProps) => {
  return new GraphQLClient(props.saleorApiUrl, {
    headers: props.token
      ? {
          "Authorization-Bearer": props.token,
        }
      : {},
  });
};
