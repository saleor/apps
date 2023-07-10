import { useAppBridge } from "@saleor/app-sdk/app-bridge";
import { useEffect, useState } from "react";

import { createGraphQLClient } from "@saleor/apps-shared";
import {
  BulkImportProductFragment,
  FetchProductsPaginatedDocument,
} from "../../../generated/graphql";

/**
 * Original source - apps/search
 */
export const useFetchAllProducts = (started: boolean, channelSlug: string) => {
  const { appBridgeState } = useAppBridge();
  const saleorApiUrl = appBridgeState?.saleorApiUrl!;

  const [products, setProducts] = useState<BulkImportProductFragment[]>([]);
  const [finished, setFinished] = useState(false);

  useEffect(() => {
    if (!started) {
      return;
    }

    if (!appBridgeState?.token) {
      return;
    }

    const token = appBridgeState.token;
    const client = createGraphQLClient({ saleorApiUrl, token });

    if (!client) {
      return;
    }

    const getProducts = async (cursor?: string): Promise<void> => {
      const response = await client
        .query(FetchProductsPaginatedDocument, {
          after: cursor,
          channel: channelSlug,
        })
        .toPromise();

      const newProducts = response?.data?.products?.edges.map((e) => e.node) ?? [];

      if (newProducts.length > 0) {
        setProducts((ps) => [...ps, ...newProducts]);
      }
      if (
        response?.data?.products?.pageInfo.hasNextPage &&
        response?.data?.products?.pageInfo.endCursor
      ) {
        return getProducts(response.data.products?.pageInfo.endCursor);
      } else {
        setFinished(true);

        return;
      }
    };

    getProducts(undefined);
  }, [appBridgeState?.token, saleorApiUrl, started, channelSlug]);

  return { products, finished };
};
