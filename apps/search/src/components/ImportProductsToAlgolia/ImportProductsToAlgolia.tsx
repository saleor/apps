import { ImportToAlgoliaCard } from "./ImportToAlgoliaCard";
import { useAlgoliaConfiguration } from "./useAlgoliaConfiguration";
import { useProductsBatchUpload } from "./useBatchUpload";

export const ImportProductsToAlgolia = () => {
  const configuration = useAlgoliaConfiguration();
  const isConfigured = configuration.type === "configured";
  const searchProvider = isConfigured ? configuration.provider : null;
  const { startUpload, uploadState } = useProductsBatchUpload(searchProvider);

  return (
    <ImportToAlgoliaCard
      title="Importing products & variants"
      description="Trigger initial indexing for products and their variants. It can take few minutes. "
      uploadState={uploadState}
      isConfigured={isConfigured}
      isLoading={configuration.type === "loading"}
      onStartImport={startUpload}
    />
  );
};
