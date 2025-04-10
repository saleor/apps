import { AuthData } from "@saleor/app-sdk/APL";

import { mockAppToken, mockedSaleorAppId } from "@/__tests__/mocks/constants";
import { mockedSaleorApiUrl } from "@/__tests__/mocks/saleor-api-url";

export const mockAuthData: AuthData = {
  appId: mockedSaleorAppId,
  saleorApiUrl: mockedSaleorApiUrl.url,
  token: mockAppToken,
};
