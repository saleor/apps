import { actions, useAppBridge } from "@saleor/app-sdk/app-bridge";
import { SALEOR_API_URL_HEADER, SALEOR_AUTHORIZATION_BEARER_HEADER } from "@saleor/app-sdk/const";
import { useCallback, useEffect, useState } from "react";
import { WebhookProductVariantFragment } from "../../../../generated/graphql";
import { Products, useQueryAllProducts } from "./useQueryAllProducts";

export interface ProductsVariantsSyncLoading {
  syncingProviderInstanceId?: string;
  currentProductIndex?: number;
  totalProductsCount?: number;
}

export type ProductsVariantsSyncOperation = "ADD" | "DELETE";

const BATCH_SIZE = 100;

interface UseProductsVariantsSyncHandlers {
  sync: (providerInstanceId: string, operation: ProductsVariantsSyncOperation) => void;
  loading: ProductsVariantsSyncLoading;
}

export const useProductsVariantsSync = (
  channelSlug: string | null,
  onSyncCompleted: (providerInstanceId: string, error?: string) => void
): UseProductsVariantsSyncHandlers => {
  const { appBridge, appBridgeState } = useAppBridge();

  const [startedProviderInstanceId, setStartedProviderInstanceId] = useState<string>();
  const [startedOperation, setStartedOperation] = useState<ProductsVariantsSyncOperation>();
  const [currentProductIndex, setCurrentProductIndex] = useState(0);
  const [isImporting, setIsImporting] = useState(false);

  const { products, fetchCompleted } = useQueryAllProducts(!startedProviderInstanceId, channelSlug);

  const sync = (providerInstanceId: string, operation: ProductsVariantsSyncOperation) => {
    setStartedProviderInstanceId(providerInstanceId);
    setStartedOperation(operation);
    setCurrentProductIndex(0);
  };

  const syncFetch = async (
    providerInstanceId: string,
    operation: ProductsVariantsSyncOperation,
    productsBatch: Products
  ) => {
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
          operation,
        }),
      });

      const syncResult = await syncResponse.json();

      return syncResult;
    } catch (error) {
      console.error("useProductsVariantsSync syncFetch error", error);
    }
  };

  const completeSync = (completedProviderInstanceIdSync: string, error?: string) => {
    setStartedProviderInstanceId(undefined);
    setStartedOperation(undefined);
    setCurrentProductIndex(0);

    onSyncCompleted(completedProviderInstanceIdSync, error);

    if (error) {
      appBridge?.dispatch(
        actions.Notification({
          title: "Error",
          status: "error",
          text: "Error syncing products variants",
          apiMessage: error,
        })
      );
    } else {
      appBridge?.dispatch(
        actions.Notification({
          title: "Success",
          status: "success",
          text: "Products variants sync completed successfully",
        })
      );
    }
  };

  useEffect(() => {
    if (
      products.length <= currentProductIndex &&
      fetchCompleted &&
      startedProviderInstanceId &&
      startedOperation
    ) {
      completeSync(startedProviderInstanceId);
    }
  }, [products.length, currentProductIndex, fetchCompleted]);

  useEffect(() => {
    if (!startedProviderInstanceId || !startedOperation) {
      return;
    }
    if (products.length <= currentProductIndex) {
      return;
    }
    if (isImporting) {
      return;
    }
    (async () => {
      setIsImporting(true);
      const productsBatchStartIndex = currentProductIndex;
      const productsBatchEndIndex = Math.min(currentProductIndex + BATCH_SIZE, products.length);
      const productsBatch = products.slice(productsBatchStartIndex, productsBatchEndIndex);

      // temporary solution, cannot use directly backend methods without fetch, due to non-browser Node dependency, like await cmsProvider.updatedBatchProducts(productsBatch);
      const syncResult = await syncFetch(
        startedProviderInstanceId,
        startedOperation,
        productsBatch
      );

      if (syncResult.error) {
        completeSync(startedProviderInstanceId, syncResult.error);
      } else {
        setCurrentProductIndex(productsBatchEndIndex);
      }

      setIsImporting(false);
    })();
  }, [
    startedProviderInstanceId,
    startedOperation,
    currentProductIndex,
    isImporting,
    products.length,
  ]);

  const loading: ProductsVariantsSyncLoading = {
    syncingProviderInstanceId: startedProviderInstanceId,
    currentProductIndex,
    totalProductsCount: products.length,
  };

  return {
    sync,
    loading,
  };
};
