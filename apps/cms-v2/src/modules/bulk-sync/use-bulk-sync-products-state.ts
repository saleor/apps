import { useCallback, useEffect, useState } from "react";
import { BulkImportProductFragment } from "../../../generated/graphql";
import { VariantsSyncStatusListItem } from "./variants-sync-status-list";

export const useBulkSyncProductsState = () => {
  const [finished, setFinished] = useState(false);
  const [productsStatusList, setProductsStatusList] = useState<VariantsSyncStatusListItem[] | null>(
    null
  );

  useEffect(() => {
    if (productsStatusList?.every((item) => item.status === "success" || item.status === "error")) {
      setFinished(true);
    }
  }, [productsStatusList]);

  return {
    finished,
    productsStatusList,
    setInitialProducts: useCallback((products: BulkImportProductFragment[]) => {
      setProductsStatusList(
        products.flatMap((p) => {
          const items: VariantsSyncStatusListItem[] =
            p.variants?.map((v) => ({
              productID: p.id,
              productName: p.name,
              status: "pending",
              variantId: v.id,
              variantName: v.name,
            })) ?? [];

          return items;
        })
      );
    }, []),
    setItemStatus: useCallback(
      (variantID: string, status: VariantsSyncStatusListItem["status"]) => {
        setProductsStatusList((items) =>
          items!.map((item) => {
            if (item.variantId === variantID) {
              return {
                ...item,
                status: status,
              };
            }

            return item;
          })
        );
      },
      []
    ),
  };
};
