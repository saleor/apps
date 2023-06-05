import { AuthData } from "@saleor/app-sdk/APL";
import { algoliaConfigurationRepository } from "../../domain/algolia-configuration/AlgoliaConfigurationRepository";

interface GetAlgoliaConfigurationArgs {
  authData: AuthData;
}

export const getAlgoliaConfiguration = async ({ authData }: GetAlgoliaConfigurationArgs) => {
  const configuration = await algoliaConfigurationRepository.getConfiguration(
    authData.saleorApiUrl
  );

  return configuration
    ? {
        settings: configuration,
      }
    : {
        errors: [{ message: "Configuration doesnt exist" }],
      };
};
