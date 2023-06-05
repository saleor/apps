import { saleorApp } from "../../../saleor-app";
import { createClient } from "../../lib/graphql";
import { algoliaConfigurationRepository } from "../../domain/algolia-configuration/AlgoliaConfigurationRepository";
import { AlgoliaSearchProvider } from "../../lib/algolia/algoliaSearchProvider";
import {
  ChannelsDocument,
  ProductsDataForImportDocument,
  ProductsDataForImportQuery,
} from "../../../generated/graphql";
import { Client } from "urql";

export type Products = NonNullable<
  ProductsDataForImportQuery["products"]
>["edges"][number]["node"][];

const getChannels = (client: Client) => client.query(ChannelsDocument, {}).toPromise();

const PER_PAGE = 100;

/**
 * TODO - refactor and split into small tested chunks, not a scope of a POC
 */
export const getProductsAndSendToAlgolia = async (saleorApiUrl: string) => {
  let products: Products = [];

  const authData = await saleorApp.apl.get(saleorApiUrl);

  if (!authData) {
    throw new Error();
  }

  const client = createClient(authData.saleorApiUrl, async () => ({
    token: authData.token,
  }));

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
      products = [...products, ...newProducts];
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

  await (async () => {
    const channels = await getChannels(client);
    // get all products for each channel

    await channels.data?.channels?.reduce(async (acc, channel) => {
      await acc;
      await getProducts(channel.slug, "");
    }, Promise.resolve());
  })();

  const configuration = await algoliaConfigurationRepository.getConfiguration(
    authData.saleorApiUrl
  ); // todo handle error

  const algolia = new AlgoliaSearchProvider({
    appId: configuration!.appId,
    apiKey: configuration!.secretKey,
    indexNamePrefix: configuration!.indexNamePrefix ?? undefined,
  });

  let currentProductIndex = 0;

  await (async () => {
    const productsBatchStartIndex = currentProductIndex;
    const productsBatchEndIndex = Math.min(currentProductIndex + PER_PAGE, products.length);
    const productsBatch = products.slice(productsBatchStartIndex, productsBatchEndIndex);

    await algolia.updatedBatchProducts(productsBatch);

    currentProductIndex = productsBatchEndIndex;
  })();
};
