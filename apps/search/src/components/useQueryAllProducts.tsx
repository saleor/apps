import { useAppBridge } from "@saleor/app-sdk/app-bridge";
import { createGraphQLClient } from "@saleor/apps-shared";
import { useEffect, useState } from "react";

import {
  ChannelsDocument,
  ProductsDataForImportDocument,
  ProductsDataForImportQuery,
} from "../../generated/graphql";

const PER_PAGE = 100;

export type Products = NonNullable<
  ProductsDataForImportQuery["products"]
>["edges"][number]["node"][];

export const useQueryAllProducts = (paused: boolean) => {
  const { appBridgeState } = useAppBridge();
  const saleorApiUrl = appBridgeState?.saleorApiUrl!;

  const [products, setProducts] = useState<Products>([]);

  useEffect(() => {
    if (paused) {
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

    const getChannels = () => client.query(ChannelsDocument, {}).toPromise();

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
      const channels = await getChannels();
      // get all products for each channel

      await channels.data?.channels?.reduce(async (acc, channel) => {
        await acc;
        await getProducts(channel.slug, "");
      }, Promise.resolve());
    })();
  }, [appBridgeState?.token, saleorApiUrl, paused]);

  return products;
};
