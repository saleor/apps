import { AuthData } from "@saleor/app-sdk/APL";

import { mockedSaleorApiUrl } from "./mocked-saleor-api-url";
import { mockedSaleorAppId } from "./mocked-saleor-app-id";

export const mockAuthData = {
  appId: mockedSaleorAppId,
  token: "XXXYYYZZZ",
  saleorApiUrl: mockedSaleorApiUrl,
} satisfies AuthData;
