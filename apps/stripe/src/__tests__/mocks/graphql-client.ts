import { createGraphQLClient } from "@saleor/apps-shared/create-graphql-client";

import { mockedAppToken } from "@/__tests__/mocks/constants";
import { mockedSaleorApiUrl } from "@/__tests__/mocks/saleor-api-url";

export const mockedGraphqlClient = createGraphQLClient({
  saleorApiUrl: mockedSaleorApiUrl,
  token: mockedAppToken,
});
