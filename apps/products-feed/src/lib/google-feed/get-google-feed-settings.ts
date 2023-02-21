import { AuthData } from "@saleor/app-sdk/APL";
import { appRouter } from "../../modules/trpc/trpc-app-router";

interface GetGoogleFeedSettingsArgs {
  authData: AuthData;
  channel: string;
}

export const getGoogleFeedSettings = async ({ authData, channel }: GetGoogleFeedSettingsArgs) => {
  const caller = appRouter.createCaller({
    appId: authData.appId,
    saleorApiUrl: authData.saleorApiUrl,
    token: authData.token,
    ssr: true,
  });

  const configurations = await caller.appConfiguration.fetch();

  const configuration = configurations.shopConfigPerChannel[channel];

  const storefrontUrl = configuration.urlConfiguration.storefrontUrl;

  const productStorefrontUrl = configuration.urlConfiguration.productStorefrontUrl;

  if (!storefrontUrl.length || !productStorefrontUrl.length) {
    throw new Error("The application has not been configured");
  }

  return {
    storefrontUrl,
    productStorefrontUrl,
  };
};
