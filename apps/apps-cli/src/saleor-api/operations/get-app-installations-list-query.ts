import request from "graphql-request";

import { graphql } from "../generated/gql";

const getAppInstallationsQueryDocument = graphql(/* GraphQL */ `
  query GetAppInstallations {
    appsInstallations {
      id
      status
      message
    }
  }
`);

export const getAppInstallationsListQuery = async ({
  saleorApiUrl,
  token,
}: {
  saleorApiUrl: string;
  token: string;
}) => {
  const { appsInstallations } = await request(
    saleorApiUrl,
    getAppInstallationsQueryDocument,
    {},
    { "Authorization-Bearer": token }
  );

  return appsInstallations;
};
