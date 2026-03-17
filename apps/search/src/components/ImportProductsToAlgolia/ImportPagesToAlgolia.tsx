import { trpcClient } from "../../modules/trpc/trpc-client";
import { ImportToAlgoliaCard } from "./ImportToAlgoliaCard";
import { useAlgoliaConfiguration } from "./useAlgoliaConfiguration";
import { usePagesBatchUpload } from "./useBatchUpload";

export const ImportPagesToAlgolia = () => {
  const configuration = useAlgoliaConfiguration();
  const isConfigured = configuration.type === "configured";
  const searchProvider = isConfigured ? configuration.provider : null;
  const { data: config } = trpcClient.configuration.getConfig.useQuery();
  const pageTypeIds = config?.pageTypesFilter?.pageTypeIds ?? [];
  const { startUpload, uploadState } = usePagesBatchUpload(searchProvider, pageTypeIds);

  return (
    <ImportToAlgoliaCard
      title="Importing pages"
      description="Trigger initial indexing for pages. It can take few minutes. "
      uploadState={uploadState}
      isConfigured={isConfigured}
      isLoading={configuration.type === "loading"}
      onStartImport={startUpload}
    />
  );
};
