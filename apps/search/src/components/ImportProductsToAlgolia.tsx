import { Box, Button, Text } from "@saleor/macaw-ui";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { AlgoliaSearchProvider } from "../lib/algolia/algoliaSearchProvider";
import { Products, useQueryAllProducts } from "./useQueryAllProducts";
import { trpcClient } from "../modules/trpc/trpc-client";
import { Layout } from "@saleor/apps-ui";

const BATCH_SIZE = 100;

export const ImportProductsToAlgolia = () => {
  const [algoliaConfigured, setAlgoliaConfigured] = useState<null | boolean>(null);
  const [started, setStarted] = useState(false);
  const [currentProductIndex, setCurrentProductIndex] = useState(0);
  const [isAlgoliaImporting, setIsAlgoliaImporting] = useState(false);

  const products = useQueryAllProducts(!started);

  const { data: algoliaConfiguration } = trpcClient.configuration.getConfig.useQuery();

  const searchProvider = useMemo(() => {
    if (!algoliaConfiguration?.appConfig?.appId || !algoliaConfiguration.appConfig?.secretKey) {
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
  ]);

  const importProducts = useCallback(() => {
    setStarted(true);
  }, []);

  useEffect(() => {
    if (searchProvider) {
      searchProvider
        .ping()
        .then(() => setAlgoliaConfigured(true))
        .catch(() => setAlgoliaConfigured(false));
    }
  }, [searchProvider]);

  useEffect(() => {
    if (!searchProvider || isAlgoliaImporting || products.length <= currentProductIndex) {
      return;
    }
    (async () => {
      setIsAlgoliaImporting(true);
      const productsBatchStartIndex = currentProductIndex;
      const productsBatchEndIndex = Math.min(currentProductIndex + BATCH_SIZE, products.length);
      const productsBatch = products.slice(productsBatchStartIndex, productsBatchEndIndex);

      await searchProvider.updatedBatchProducts(productsBatch);

      setIsAlgoliaImporting(false);
      setCurrentProductIndex(productsBatchEndIndex);
    })();
  }, [searchProvider, currentProductIndex, isAlgoliaImporting, products]);

  return (
    <Layout.AppSectionCard
      footer={
        searchProvider &&
        algoliaConfigured && (
          <Box display={"flex"} justifyContent={"flex-end"}>
            <Button disabled={started || !searchProvider} onClick={importProducts}>
              Start importing
            </Button>
          </Box>
        )
      }
      __cursor={started ? "wait" : "auto"}
    >
      {searchProvider && algoliaConfigured ? (
        <Box>
          <Text variant={"heading"} as={"p"} marginBottom={1.5}>
            Importing products & variants
          </Text>
          <Text as={"p"}>
            Trigger initial indexing for products catalogue. It can take few minutes.{" "}
          </Text>
          <Text marginBottom={5} variant={"bodyStrong"}>
            Do not close the app - its running client-side
          </Text>
        </Box>
      ) : (
        <Box>
          <Text variant={"heading"} as={"p"} color={"textCriticalDefault"} marginBottom={1.5}>
            App not configured
          </Text>
          <Text>Configure Algolia first</Text>
        </Box>
      )}

      {started && (
        <div
          style={{
            marginTop: "20px",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          {countVariants(products, currentProductIndex)} /{" "}
          {countVariants(products, products.length)}
          <progress
            value={currentProductIndex}
            max={products.length}
            style={{
              height: "30px",
              width: "500px",
              maxWidth: "100%",
            }}
          />
        </div>
      )}
    </Layout.AppSectionCard>
  );
};

const countVariants = (products: Products, index: number) =>
  products.slice(0, index).reduce((acc, p) => acc + (p.variants?.length ?? 0), 0);
