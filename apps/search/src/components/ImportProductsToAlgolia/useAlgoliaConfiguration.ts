import { useEffect, useState } from "react";

import { algoliaCredentialsVerifier } from "../../lib/algolia/algolia-credentials-verifier";
import { AlgoliaSearchProvider } from "../../lib/algolia/algoliaSearchProvider";
import { trpcClient } from "../../modules/trpc/trpc-client";
import { useSearchProvider } from "./useSearchProvider";

type AlgoliaConfiguration =
  | { type: "configured"; provider: AlgoliaSearchProvider }
  | { type: "not-configured" }
  | { type: "loading" };

export const useAlgoliaConfiguration = (): AlgoliaConfiguration => {
  const [algoliaConfigured, setAlgoliaConfigured] = useState<null | boolean>(null);
  const { data: algoliaConfiguration, isLoading } = trpcClient.configuration.getConfig.useQuery();
  const searchProvider = useSearchProvider(algoliaConfiguration);

  useEffect(() => {
    if (algoliaConfiguration?.appConfig) {
      algoliaCredentialsVerifier
        .verifyCredentials({
          appId: algoliaConfiguration.appConfig.appId,
          apiKey: algoliaConfiguration.appConfig.secretKey,
        })
        .then(() => setAlgoliaConfigured(true))
        .catch(() => setAlgoliaConfigured(false));
    }
  }, [algoliaConfiguration?.appConfig]);

  if (isLoading) {
    return { type: "loading" };
  }

  if (!algoliaConfiguration || !algoliaConfigured || !searchProvider) {
    return { type: "not-configured" };
  }

  return { type: "configured", provider: searchProvider };
};
