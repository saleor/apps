import { useAppBridge } from "@saleor/app-sdk/app-bridge";
import { createGraphQLClient } from "@saleor/apps-shared/create-graphql-client";

import {
  CategoriesDataForImportDocument,
  type CategoriesDataForImportQuery,
  ChannelsDocument,
  type PageFilterInput,
  PagesDataForImportDocument,
  type PagesDataForImportQuery,
  ProductsDataForImportDocument,
  type ProductsDataForImportQuery,
} from "../../../generated/graphql";

const PER_PAGE = 100;

export type Products = NonNullable<
  ProductsDataForImportQuery["products"]
>["edges"][number]["node"][];

export type Categories = NonNullable<
  CategoriesDataForImportQuery["categories"]
>["edges"][number]["node"][];

export type Pages = NonNullable<PagesDataForImportQuery["pages"]>["edges"][number]["node"][];

export const useGraphQLClient = () => {
  const { appBridgeState } = useAppBridge();
  const saleorApiUrl = appBridgeState?.saleorApiUrl!;
  const token = appBridgeState!.token;
  const client = createGraphQLClient({ saleorApiUrl, token });

  const getChannels = () => client.query(ChannelsDocument, {}).toPromise();

  async function* getProductsByChannel(
    channelSlug: string,
    cursor: string = "",
  ): AsyncGenerator<Products> {
    const response = await client
      .query(ProductsDataForImportDocument, {
        after: cursor,
        first: PER_PAGE,
        channel: channelSlug,
      })
      .toPromise();

    const newProducts = response?.data?.products?.edges.map((e) => e.node) ?? [];

    if (newProducts.length > 0) {
      yield newProducts;
    }
    if (
      response?.data?.products?.pageInfo.hasNextPage &&
      response?.data?.products?.pageInfo.endCursor
    ) {
      yield* getProductsByChannel(channelSlug, response.data.products?.pageInfo.endCursor);
    }
  }

  async function* getCategories(cursor: string = ""): AsyncGenerator<Categories> {
    const response = await client
      .query(CategoriesDataForImportDocument, {
        after: cursor,
        first: PER_PAGE,
      })
      .toPromise();

    const newCategories = response?.data?.categories?.edges.map((e) => e.node) ?? [];

    if (newCategories.length > 0) {
      yield newCategories;
    }
    if (
      response?.data?.categories?.pageInfo.hasNextPage &&
      response?.data?.categories?.pageInfo.endCursor
    ) {
      yield* getCategories(response.data.categories?.pageInfo.endCursor);
    }
  }

  async function* getPages(pageTypeIds: string[] = [], cursor: string = ""): AsyncGenerator<Pages> {
    if (pageTypeIds.length === 0) {
      return;
    }

    const filter: PageFilterInput = { pageTypes: pageTypeIds };

    const response = await client
      .query(PagesDataForImportDocument, {
        after: cursor,
        first: PER_PAGE,
        filter,
      })
      .toPromise();

    const newPages = response?.data?.pages?.edges.map((e) => e.node) ?? [];

    if (newPages.length > 0) {
      yield newPages;
    }
    if (response?.data?.pages?.pageInfo.hasNextPage && response?.data?.pages?.pageInfo.endCursor) {
      yield* getPages(pageTypeIds, response.data.pages?.pageInfo.endCursor);
    }
  }

  return { getChannels, getProductsByChannel, getCategories, getPages };
};
