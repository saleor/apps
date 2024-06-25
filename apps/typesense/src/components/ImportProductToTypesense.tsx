import { Box, Button, Text } from "@saleor/macaw-ui";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Products, useQueryAllProducts } from "./useQueryAllProducts";
import { trpcClient } from "../modules/trpc/trpc-client";
import { Layout } from "@saleor/apps-ui";
import { TypesenseSearchProvider } from "../lib/typesense/typesenseSearchProvider";
import { typesenseCredentialsVerifier } from "../lib/typesense/typesense-credentials-verifier";

const BATCH_SIZE = 100;

export const ImportProductsToTypesense = () => {
  const [typesenseConfigured, setTypesenseConfigured] = useState<null | boolean>(null);
  const [started, setStarted] = useState(false);
  const [currentProductIndex, setCurrentProductIndex] = useState(0);
  const [isTypesenseImporting, setIsTypesenseImporting] = useState(false);
  const products = useQueryAllProducts(!started);

  const { data: typesenseConfiguration } = trpcClient.configuration.getConfig.useQuery();

  const searchProvider = useMemo(() => {
    if (!typesenseConfiguration?.appConfig?.host || !typesenseConfiguration.appConfig?.apiKey) {
      return null;
    }
    return new TypesenseSearchProvider({
      host: typesenseConfiguration.appConfig.host,
      apiKey: typesenseConfiguration.appConfig.apiKey,
      protocol: typesenseConfiguration.appConfig.protocol,
      port: typesenseConfiguration.appConfig.port,
      connectionTimeoutSeconds: typesenseConfiguration.appConfig.connectionTimeoutSeconds,
      enabledKeys: typesenseConfiguration.fieldsMapping.enabledTypesenseFields,
    });
  }, [
    typesenseConfiguration?.appConfig?.apiKey,
    typesenseConfiguration?.appConfig?.connectionTimeoutSeconds,
    typesenseConfiguration?.appConfig?.host,
    typesenseConfiguration?.appConfig?.port,
    typesenseConfiguration?.appConfig?.protocol,
    typesenseConfiguration?.fieldsMapping?.enabledTypesenseFields,
  ]);

  const importProducts = useCallback(() => {
    setStarted(true);
  }, []);

  useEffect(() => {
    if (searchProvider && typesenseConfiguration?.appConfig) {
      typesenseCredentialsVerifier
        .verifyCredentials({
          host: typesenseConfiguration.appConfig.host,
          apiKey: typesenseConfiguration.appConfig.apiKey,
          protocol: typesenseConfiguration.appConfig.protocol,
          port: typesenseConfiguration.appConfig.port,
          connectionTimeoutSeconds: typesenseConfiguration.appConfig.connectionTimeoutSeconds,
        })
        .then(() => setTypesenseConfigured(true))
        .catch(() => setTypesenseConfigured(false));
    }
  }, [searchProvider, typesenseConfiguration?.appConfig]);

  useEffect(() => {
    if (!searchProvider || isTypesenseImporting || products.length <= currentProductIndex) {
      return;
    }
    (async () => {
      setIsTypesenseImporting(true);
      const productsBatchStartIndex = currentProductIndex;
      const productsBatchEndIndex = Math.min(currentProductIndex + BATCH_SIZE, products.length);
      const productsBatch = products.slice(productsBatchStartIndex, productsBatchEndIndex);

      await searchProvider.updatedBatchProducts(productsBatch);

      setIsTypesenseImporting(false);
      setCurrentProductIndex(productsBatchEndIndex);
    })();
  }, [searchProvider, currentProductIndex, isTypesenseImporting, products]);

  return (
    <Layout.AppSectionCard
      footer={
        searchProvider &&
        typesenseConfigured && (
          <Box display={"flex"} justifyContent={"flex-end"}>
            <Button disabled={started || !searchProvider} onClick={importProducts}>
              Start importing
            </Button>
          </Box>
        )
      }
      __cursor={started ? "wait" : "auto"}
    >
      {searchProvider && typesenseConfigured ? (
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
          <Text>Configure Typesense first</Text>
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
