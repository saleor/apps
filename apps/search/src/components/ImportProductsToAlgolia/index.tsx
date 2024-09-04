import { Layout } from "@saleor/apps-ui";
import { Box, Button, Text } from "@saleor/macaw-ui";

import { useAlgoliaConfiguration } from "./useAlgoliaConfiguration";
import { useBatchUpload } from "./useBatchUpload";

export const ImportProductsToAlgolia = () => {
  const configuration = useAlgoliaConfiguration();
  const isConfigured = configuration.type === "configured";
  const searchProvider = isConfigured ? configuration.provider : null;
  const { startUpload, uploadState } = useBatchUpload(searchProvider);

  return (
    <Layout.AppSectionCard
      footer={
        isConfigured && (
          <Box display={"flex"} justifyContent={"flex-end"}>
            <Button disabled={uploadState.type === "uploading"} onClick={startUpload}>
              {uploadState.type === "uploading" ? "Importing..." : "Start importing"}
            </Button>
          </Box>
        )
      }
      __cursor={uploadState.type === "uploading" ? "wait" : "auto"}
    >
      {configuration.type === "loading" ? (
        <Box>
          <Text size={5} fontWeight="bold" as={"p"} marginBottom={1.5}>
            Loading configuration...
          </Text>
        </Box>
      ) : isConfigured ? (
        <Box>
          <Text size={5} fontWeight="bold" as={"p"} marginBottom={1.5}>
            Importing products & variants
          </Text>
          <Text as={"p"}>
            Trigger initial indexing for products catalogue. It can take few minutes.{" "}
          </Text>
          <Text marginBottom={5} size={4} fontWeight="bold">
            Do not close the app - its running client-side
          </Text>
        </Box>
      ) : (
        <Box>
          <Text size={5} fontWeight="bold" as={"p"} color={"critical1"} marginBottom={1.5}>
            App not configured
          </Text>
          <Text>Configure Algolia first</Text>
        </Box>
      )}

      {uploadState.type === "success" && (
        <Box marginTop={5}>
          <Text size={5} fontWeight="bold" as="p">
            Import finished successfully!
          </Text>
        </Box>
      )}

      {uploadState.type === "uploading" && (
        <Box
          style={{
            marginTop: "20px",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <Text as="p" marginBottom={2}>
            {uploadState.progress.current} / {uploadState.progress.total} products imported
          </Text>
          <progress
            value={uploadState.progress.current}
            max={uploadState.progress.total}
            style={{
              height: "30px",
              width: "500px",
              maxWidth: "100%",
            }}
          />
          {uploadState.isFinishing && (
            <Text as="p" marginTop={2}>
              Finishing...
            </Text>
          )}
        </Box>
      )}

      {uploadState.type === "error" && (
        <Box marginTop={5}>
          <Text size={5} fontWeight="bold" as="p" color="critical1">
            An error occurred during import
          </Text>
          <Text as="p">{uploadState.error.message}</Text>
        </Box>
      )}
    </Layout.AppSectionCard>
  );
};
