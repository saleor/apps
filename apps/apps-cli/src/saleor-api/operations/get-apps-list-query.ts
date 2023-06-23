import request from "graphql-request";

import { graphql } from "../generated/gql";

export const AppDetailsFragment = graphql(/* GraphQL */ `
  fragment AppDetails on App {
    id
    name
    isActive
    type
    created
    manifestUrl
  }
`);

const getAppsQueryDocument = graphql(/* GraphQL */ `
  query GetApps {
    apps(
      first: 100
      filter: { type: THIRDPARTY }
      sortBy: { field: CREATION_DATE, direction: DESC }
    ) {
      totalCount
      edges {
        node {
          ...AppDetails
        }
      }
    }
  }
`);

export const getAppsListQuery = async ({
  saleorApiUrl,
  token,
}: {
  saleorApiUrl: string;
  token: string;
}) => {
  const { apps } = await request(
    saleorApiUrl,
    getAppsQueryDocument,
    {},
    { "Authorization-Bearer": token }
  );

  return apps?.edges.map(({ node }) => node) ?? [];
};
