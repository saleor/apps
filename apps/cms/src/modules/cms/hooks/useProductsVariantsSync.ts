import { useAppBridge } from "@saleor/app-sdk/app-bridge";
import { SALEOR_API_URL_HEADER, SALEOR_AUTHORIZATION_BEARER_HEADER } from "@saleor/app-sdk/const";
import { useCallback, useEffect, useState } from "react";
import { WebhookProductVariantFragment } from "../../../../generated/graphql";
import { Products, useQueryAllProducts } from "./useQueryAllProducts";

const BATCH_SIZE = 100;

interface UseProductsVariantsSyncHandlers {
  sync: (providerInstanceId: string) => void;
}

export const useProductsVariantsSync = (
  channelSlug: string | null
): UseProductsVariantsSyncHandlers => {
  const { appBridgeState } = useAppBridge();

  const [startedProviderInstanceId, setStartedProviderInstanceId] = useState<string>();
  const [currentProductIndex, setCurrentProductIndex] = useState(0);
  const [isImporting, setIsImporting] = useState(false);

  const products = useQueryAllProducts(!startedProviderInstanceId, channelSlug);

  const sync = useCallback((providerInstanceId: string) => {
    setStartedProviderInstanceId(providerInstanceId);
  }, []);

  const syncFetch = async (providerInstanceId: string, productsBatch: Products) => {
    console.log("useProductsVariantsSync", "sync", {
      providerInstanceId,
      productsBatch,
    });

    const productsVariants = productsBatch.reduce((acc, product) => {
      const variants = product.variants?.map((variant) => {
        const { variants: _, ...productFields } = product;
        return {
          product: productFields,
          ...variant,
        };
      });

      return variants ? [...acc, ...variants] : acc;
    }, [] as WebhookProductVariantFragment[]);

    try {
      const syncResponse = await fetch("/api/sync-products-variants", {
        method: "POST",
        headers: [
          ["content-type", "application/json"],
          [SALEOR_API_URL_HEADER, appBridgeState?.saleorApiUrl!],
          [SALEOR_AUTHORIZATION_BEARER_HEADER, appBridgeState?.token!],
        ],
        body: JSON.stringify({
          providerInstanceId,
          productsVariants,
        }),
      });

      const syncResult = await syncResponse.json();

      console.log("useProductsVariantsSync", "sync", "syncResult", syncResult);

      return syncResult;
    } catch (error) {
      console.log("useProductsVariantsSync", "sync", "error", error);
    }
  };

  useEffect(() => {
    if (!startedProviderInstanceId) {
      setStartedProviderInstanceId(undefined);
      return;
    }
    if (isImporting || products.length <= currentProductIndex) {
      return;
    }
    (async () => {
      setIsImporting(true);
      const productsBatchStartIndex = currentProductIndex;
      const productsBatchEndIndex = Math.min(currentProductIndex + BATCH_SIZE, products.length);
      const productsBatch = products.slice(productsBatchStartIndex, productsBatchEndIndex);

      // await searchProvider.updatedBatchProducts(productsBatch);
      await syncFetch(startedProviderInstanceId, productsBatch);

      setIsImporting(false);
      setCurrentProductIndex(productsBatchEndIndex);
    })();
  }, [startedProviderInstanceId, currentProductIndex, isImporting, products]);

  return {
    sync,
  };
};
