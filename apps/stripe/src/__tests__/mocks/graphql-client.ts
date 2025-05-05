import { mockedAppToken } from "@/__tests__/mocks/constants";
import { mockedSaleorApiUrl } from "@/__tests__/mocks/saleor-api-url";
import { createInstrumentedGraphqlClient } from "@/lib/graphql-client";

export const mockedGraphqlClient = createInstrumentedGraphqlClient({
  saleorApiUrl: mockedSaleorApiUrl,
  token: mockedAppToken,
});
