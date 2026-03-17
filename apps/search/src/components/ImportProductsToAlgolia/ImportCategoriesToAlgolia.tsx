import { ImportToAlgoliaCard } from "./ImportToAlgoliaCard";
import { useAlgoliaConfiguration } from "./useAlgoliaConfiguration";
import { useCategoriesBatchUpload } from "./useBatchUpload";

export const ImportCategoriesToAlgolia = () => {
  const configuration = useAlgoliaConfiguration();
  const isConfigured = configuration.type === "configured";
  const searchProvider = isConfigured ? configuration.provider : null;
  const { startUpload, uploadState } = useCategoriesBatchUpload(searchProvider);

  return (
    <ImportToAlgoliaCard
      title="Importing categories"
      description="Trigger initial indexing for categories. It can take few minutes. "
      uploadState={uploadState}
      isConfigured={isConfigured}
      isLoading={configuration.type === "loading"}
      onStartImport={startUpload}
    />
  );
};
