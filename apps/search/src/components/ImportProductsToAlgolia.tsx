import { useAppBridge } from "@saleor/app-sdk/app-bridge";
import { Button } from "@saleor/macaw-ui";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { AlgoliaSearchProvider } from "../lib/algolia/algoliaSearchProvider";
import { useConfiguration } from "../lib/configuration";
import { Products, useQueryAllProducts } from "./useQueryAllProducts";
import { WarningOutlined, WarningRounded } from "@material-ui/icons";
import { Typography } from "@material-ui/core";

const BATCH_SIZE = 100;

export const ImportProductsToAlgolia = () => {
  const [started, setStarted] = useState(false);
  const [currentProductIndex, setCurrentProductIndex] = useState(0);
  const [isAlgoliaImporting, setIsAlgoliaImporting] = useState(false);

  const products = useQueryAllProducts(!started);

  const { appBridgeState } = useAppBridge();
  const algoliaConfiguration = useConfiguration(
    appBridgeState?.saleorApiUrl,
    appBridgeState?.token
  );

  const searchProvider = useMemo(() => {
    if (!algoliaConfiguration.data?.appId || !algoliaConfiguration.data.secretKey) {
      return null;
    }
    return new AlgoliaSearchProvider({
      appId: algoliaConfiguration.data.appId,
      apiKey: algoliaConfiguration.data.secretKey,
      indexNamePrefix: algoliaConfiguration.data.indexNamePrefix,
    });
  }, [
    algoliaConfiguration?.data?.appId,
    algoliaConfiguration?.data?.indexNamePrefix,
    algoliaConfiguration?.data?.secretKey,
  ]);

  const importProducts = useCallback(() => {
    setStarted(true);
  }, []);

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
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        paddingBottom: 32,
        cursor: started ? "wait" : "auto",
      }}
    >
      {searchProvider ? (
        <Button disabled={started || !searchProvider} onClick={importProducts} fullWidth>
          Start importing products and variants to Algolia
        </Button>
      ) : (
        <div>
          <Typography align="center">
            <WarningRounded />
          </Typography>
          <Typography>Ensure Algolia is configured</Typography>
        </div>
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
    </div>
  );
};

const countVariants = (products: Products, index: number) =>
  products.slice(0, index).reduce((acc, p) => acc + (p.variants?.length ?? 0), 0);
