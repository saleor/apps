import { useAppBridge } from "@saleor/app-sdk/app-bridge";
import { useEffect, useState } from "react";
import {
  ProductsDataForImportDocument,
  ProductsDataForImportQuery,
} from "../../../../generated/graphql";
import { nextClient } from "../../../lib/graphql";

const PER_PAGE = 100;

export type Products = NonNullable<
  ProductsDataForImportQuery["products"]
>["edges"][number]["node"][];

export const useQueryAllProducts = (paused: boolean, channelSlug: string | null) => {
  const { appBridgeState } = useAppBridge();
  const saleorApiUrl = appBridgeState?.saleorApiUrl!;

  const [products, setProducts] = useState<Products>([]);

  useEffect(() => {
    if (paused || !channelSlug) {
      return;
    }

    if (!appBridgeState?.token) {
      return;
    }

    const token = appBridgeState.token;
    const client = nextClient(saleorApiUrl, () => Promise.resolve({ token }));

    if (!client) {
      return;
    }

    const getProducts = async (channelSlug: string, cursor: string): Promise<void> => {
      const response = await client
        .query(ProductsDataForImportDocument, {
          after: cursor,
          first: PER_PAGE,
          channel: channelSlug!,
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
        // get next page of products
        return getProducts(channelSlug, response.data.products?.pageInfo.endCursor);
      } else {
        // do nothing
        return;
      }
    };

    (async () => {
      await getProducts(channelSlug, "");
    })();
  }, [appBridgeState?.token, saleorApiUrl, paused, channelSlug]);

  return products;
};
