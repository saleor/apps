import { inferProcedureOutput } from "@trpc/server";
import { useMemo } from "react";

import { AlgoliaSearchProvider } from "../../lib/algolia/algoliaSearchProvider";
import { AppRouter } from "../../modules/trpc/trpc-app-router";

type AlgoliaConfiguration = inferProcedureOutput<AppRouter["configuration"]["getConfig"]>;

export const useSearchProvider = (algoliaConfiguration?: AlgoliaConfiguration) => {
  const searchProvider = useMemo(() => {
    if (!algoliaConfiguration?.appConfig?.appId || !algoliaConfiguration?.appConfig?.secretKey) {
      return null;
    }
    return new AlgoliaSearchProvider({
      appId: algoliaConfiguration.appConfig.appId,
      apiKey: algoliaConfiguration.appConfig.secretKey,
      indexNamePrefix: algoliaConfiguration.appConfig.indexNamePrefix,
      enabledKeys: algoliaConfiguration.fieldsMapping.enabledAlgoliaFields,
    });
  }, [
    algoliaConfiguration?.appConfig?.appId,
    algoliaConfiguration?.appConfig?.indexNamePrefix,
    algoliaConfiguration?.appConfig?.secretKey,
    algoliaConfiguration?.fieldsMapping?.enabledAlgoliaFields,
  ]);

  return searchProvider;
};
