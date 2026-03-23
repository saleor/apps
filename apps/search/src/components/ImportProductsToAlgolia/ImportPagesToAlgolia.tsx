import { Layout } from "@saleor/apps-ui";
import { Box, Text } from "@saleor/macaw-ui";

import { ImportToAlgoliaCard } from "./ImportToAlgoliaCard";
import { useAlgoliaConfiguration } from "./useAlgoliaConfiguration";
import { usePagesBatchUpload } from "./useBatchUpload";

interface ImportPagesToAlgoliaProps {
  pageTypeIds: string[];
}

export const ImportPagesToAlgolia = ({ pageTypeIds }: ImportPagesToAlgoliaProps) => {
  const configuration = useAlgoliaConfiguration();
  const isConfigured = configuration.type === "configured";
  const searchProvider = isConfigured ? configuration.provider : null;
  const { startUpload, uploadState } = usePagesBatchUpload(searchProvider);

  const hasPageTypes = pageTypeIds.length > 0;

  const handleStartImport = () => {
    startUpload(pageTypeIds);
  };

  if (isConfigured && !hasPageTypes) {
    return (
      <Layout.AppSectionCard>
        <Box>
          <Text size={5} fontWeight="bold" as="p" marginBottom={1.5}>
            Importing pages
          </Text>
          <Text as="p">
            Select at least one page type in the &quot;Page types filter&quot; section above to
            enable page indexing.
          </Text>
        </Box>
      </Layout.AppSectionCard>
    );
  }

  return (
    <ImportToAlgoliaCard
      title="Importing pages"
      description="Trigger initial indexing for pages. It can take few minutes. "
      uploadState={uploadState}
      isConfigured={isConfigured}
      isLoading={configuration.type === "loading"}
      onStartImport={handleStartImport}
    />
  );
};
