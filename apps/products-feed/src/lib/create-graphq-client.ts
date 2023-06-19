import { AuthData } from "@saleor/app-sdk/APL";
import { createGraphQLClient } from "@saleor/apps-shared";

export const GraphqlClientFactory = {
  fromAuthData(authData: Pick<AuthData, "token" | "saleorApiUrl">) {
    return createGraphQLClient({
      saleorApiUrl: authData.saleorApiUrl,
      token: authData.token,
    });
  },
};
