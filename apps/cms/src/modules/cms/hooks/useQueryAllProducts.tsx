import { useAppBridge } from "@saleor/app-sdk/app-bridge";
import { useEffect, useState } from "react";
import {
  ProductsDataForImportDocument,
  ProductsDataForImportQuery,
} from "../../../../generated/graphql";
import { createClient } from "../../../lib/graphql";

const PER_PAGE = 100;

export type Products = NonNullable<
  ProductsDataForImportQuery["products"]
>["edges"][number]["node"][];

export const useQueryAllProducts = (paused: boolean, channelSlug: string | null) => {
  const { appBridgeState } = useAppBridge();
  const saleorApiUrl = appBridgeState?.saleorApiUrl!;

  const [products, setProducts] = useState<Products>([]);
  const [fetchCompleted, setFetchCompleted] = useState(false);

  useEffect(() => {
    if (paused) {
      setProducts([]);
      setFetchCompleted(false);
    }
  }, [paused]);

  useEffect(() => {
    if (paused || !channelSlug || !appBridgeState?.token) {
      return;
    }

    const token = appBridgeState.token;
    const client = createClient(saleorApiUrl, () => Promise.resolve({ token }));

    if (!client) {
      return;
    }

    const getProducts = async (channelSlug: string, cursor: string): Promise<void> => {
      const response = await client
        .query(
          ProductsDataForImportDocument,
          {
            after: cursor,
            first: PER_PAGE,
            channel: channelSlug!,
          },
          {
            requestPolicy: "network-only", // Invalidate products data, because it could contain legacy products variants metadata that indicates these products variants existance in CMS providers
          }
        )
        .toPromise();

      const newProducts = response?.data?.products?.edges.map((e) => e.node) ?? [];

      if (newProducts.length > 0) {
        setProducts((ps) => [...ps, ...newProducts]);
      }
      if (
        response?.data?.products?.pageInfo.hasNextPage &&
        response?.data?.products?.pageInfo.endCursor
      ) {
        // get next page of products
        return getProducts(channelSlug, response.data.products?.pageInfo.endCursor);
      } else {
        setFetchCompleted(true);
      }
    };

    (async () => {
      await getProducts(channelSlug, "");
    })();
  }, [appBridgeState?.token, saleorApiUrl, paused, channelSlug]);

  return {
    products,
    fetchCompleted,
  };
};
