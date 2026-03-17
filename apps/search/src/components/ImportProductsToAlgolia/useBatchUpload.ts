import { useAppBridge } from "@saleor/app-sdk/app-bridge";
import { createGraphQLClient } from "@saleor/apps-shared/create-graphql-client";
import { useState } from "react";

import {
  CategoriesDataForImportDocument,
  type CategoriesDataForImportQuery,
  ChannelsDocument,
  PagesDataForImportDocument,
  type PagesDataForImportQuery,
  ProductsDataForImportDocument,
  type ProductsDataForImportQuery,
} from "../../../generated/graphql";
import { type AlgoliaSearchProvider } from "../../lib/algolia/algoliaSearchProvider";

const PER_PAGE = 100;
const PENDING_UPLOADS_BATCH_SIZE = 10;

export type Products = NonNullable<
  ProductsDataForImportQuery["products"]
>["edges"][number]["node"][];

export type Categories = NonNullable<
  CategoriesDataForImportQuery["categories"]
>["edges"][number]["node"][];

export type Pages = NonNullable<PagesDataForImportQuery["pages"]>["edges"][number]["node"][];

type UploadState =
  | { type: "idle" }
  | { type: "uploading"; progress: { current: number; total: number }; isFinishing: boolean }
  | { type: "error"; error: Error }
  | { type: "success" };

const useUploadState = () => {
  const [uploadState, setUploadState] = useState<UploadState>({ type: "idle" });

  const incrementTotal = (total: number) => {
    setUploadState((state) => {
      if (state.type !== "uploading") return state;

      return {
        ...state,
        progress: {
          ...state.progress,
          total: state.progress.total + total,
        },
      };
    });
  };

  const incrementCurrent = (current: number) => {
    setUploadState((state) => {
      if (state.type !== "uploading") return state;

      return {
        ...state,
        progress: {
          ...state.progress,
          current: state.progress.current + current,
        },
      };
    });
  };

  const finishUpload = () => {
    setUploadState({ type: "success" });
  };

  const finishingUpload = () => {
    setUploadState((current) => {
      if (current.type !== "uploading") return current;

      return { ...current, isFinishing: true };
    });

    const timeout = setTimeout(() => {
      finishUpload();
      clearTimeout(timeout);
    }, 1000);
  };

  const startUploading = () => {
    setUploadState({
      type: "uploading",
      progress: { current: 0, total: 0 },
      isFinishing: false,
    });
  };

  return {
    uploadState,
    incrementTotal,
    incrementCurrent,
    finishingUpload,
    startUploading,
  };
};

const useGraphQLClient = () => {
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

  async function* getPages(cursor: string = ""): AsyncGenerator<Pages> {
    const response = await client
      .query(PagesDataForImportDocument, {
        after: cursor,
        first: PER_PAGE,
      })
      .toPromise();

    const newPages = response?.data?.pages?.edges.map((e) => e.node) ?? [];

    if (newPages.length > 0) {
      yield newPages;
    }
    if (response?.data?.pages?.pageInfo.hasNextPage && response?.data?.pages?.pageInfo.endCursor) {
      yield* getPages(response.data.pages?.pageInfo.endCursor);
    }
  }

  return { getChannels, getProductsByChannel, getCategories, getPages };
};

const useDataFetcher = () => {
  const { getChannels, getProductsByChannel, getCategories, getPages } = useGraphQLClient();

  async function* getProducts() {
    const channelsResponse = await getChannels();
    const channels = channelsResponse.data?.channels;

    if (!channels) return;

    for (const channel of channels) {
      yield* getProductsByChannel(channel.slug);
    }
  }

  return { getProducts, getCategories, getPages };
};

export const useBatchUpload = (searchProvider: AlgoliaSearchProvider | null) => {
  const { uploadState, incrementTotal, incrementCurrent, finishingUpload, startUploading } =
    useUploadState();
  const { getProducts, getCategories, getPages } = useDataFetcher();

  const uploadProductsToAlgolia = async (products: Products) => {
    if (!searchProvider) return;

    await searchProvider.updatedBatchProducts(products);

    incrementCurrent(products.length);
  };

  const uploadCategoriesToAlgolia = async (categories: Categories) => {
    if (!searchProvider) return;

    await searchProvider.updatedBatchCategories(categories);

    incrementCurrent(categories.length);
  };

  const uploadPagesToAlgolia = async (pages: Pages) => {
    if (!searchProvider) return;

    await searchProvider.updatedBatchPages(pages);

    incrementCurrent(pages.length);
  };

  const startUpload = async () => {
    if (!searchProvider) return;

    startUploading();
    let pendingUploads = [];

    for await (const products of getProducts()) {
      incrementTotal(products.length);
      pendingUploads.push(uploadProductsToAlgolia(products));

      if (pendingUploads.length >= PENDING_UPLOADS_BATCH_SIZE) {
        await Promise.all(pendingUploads);
        pendingUploads = [];
      }
    }

    if (pendingUploads.length > 0) {
      await Promise.all(pendingUploads);
    }

    for await (const categories of getCategories()) {
      incrementTotal(categories.length);
      pendingUploads.push(uploadCategoriesToAlgolia(categories));

      if (pendingUploads.length >= PENDING_UPLOADS_BATCH_SIZE) {
        await Promise.all(pendingUploads);
        pendingUploads = [];
      }
    }

    if (pendingUploads.length > 0) {
      await Promise.all(pendingUploads);
      pendingUploads = [];
    }

    for await (const pages of getPages()) {
      incrementTotal(pages.length);
      pendingUploads.push(uploadPagesToAlgolia(pages));

      if (pendingUploads.length >= PENDING_UPLOADS_BATCH_SIZE) {
        await Promise.all(pendingUploads);
        pendingUploads = [];
      }
    }

    if (pendingUploads.length > 0) {
      await Promise.all(pendingUploads);
    }

    finishingUpload();
  };

  return { startUpload, uploadState };
};
