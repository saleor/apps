import { createGraphQLClient } from "@saleor/apps-shared/create-graphql-client";

import { mockAuthData } from "@/__tests__/mocks/saleor/mocked-auth-data";
import { mockedSaleorApiUrl } from "@/__tests__/mocks/saleor/mocked-saleor-api-url";

export const mockedGraphqlClient = createGraphQLClient({
  saleorApiUrl: mockedSaleorApiUrl,
  token: mockAuthData.token,
});
