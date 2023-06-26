import request from "graphql-request";

import { graphql } from "../generated/gql";

const getAppMetadataQueryDocument = graphql(/* GraphQL */ `
  query GetAppMetadata {
    app(id: "QXBwOjE=") {
      metadata {
        key
        value
      }
    }
  }
`);

export const getAppMetadataQuery = async ({
  saleorApiUrl,
  token,
}: {
  saleorApiUrl: string;
  token: string;
}) => {
  const { app } = await request(
    saleorApiUrl,
    getAppMetadataQueryDocument,
    {},
    { "Authorization-Bearer": token }
  );

  return app?.metadata ?? [];
};
