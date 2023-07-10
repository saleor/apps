import { useCallback, useState } from "react";
import { BulkImportProductFragment } from "../../../generated/graphql";
import { VariantsSyncStatusListItem } from "./variants-sync-status-list";

export const useBulkSyncProductsState = () => {
  const [productsStatusList, setProductsStatusList] = useState<VariantsSyncStatusListItem[] | null>(
    null
  );

  return {
    productsStatusList,
    setInitialProducts: useCallback((products: BulkImportProductFragment[]) => {
      setProductsStatusList(
        products.flatMap((p) => {
          console.log(p);

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
