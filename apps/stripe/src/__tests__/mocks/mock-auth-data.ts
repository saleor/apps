import { AuthData } from "@saleor/app-sdk/APL";

import { mockedAppToken, mockedSaleorAppId } from "@/__tests__/mocks/constants";
import { mockedSaleorApiUrl } from "@/__tests__/mocks/saleor-api-url";

export const mockAuthData: AuthData = {
  appId: mockedSaleorAppId,
  token: mockedAppToken,
  saleorApiUrl: mockedSaleorApiUrl,
};
