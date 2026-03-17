import { useAppBridge } from "@saleor/app-sdk/app-bridge";
import { createGraphQLClient } from "@saleor/apps-shared/create-graphql-client";
import { useState } from "react";

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

export type UploadState =
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

  async function* getPages(pageTypeIds: string[] = [], cursor: string = ""): AsyncGenerator<Pages> {
    const filter: PageFilterInput | undefined =
      pageTypeIds.length > 0 ? { pageTypes: pageTypeIds } : undefined;

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

const runBatchedUpload = async <T>(
  generator: AsyncGenerator<T[]>,
  upload: (batch: T[]) => Promise<void>,
  incrementTotal: (total: number) => void,
) => {
  let pendingUploads: Promise<void>[] = [];

  for await (const batch of generator) {
    incrementTotal(batch.length);
    pendingUploads.push(upload(batch));

    if (pendingUploads.length >= PENDING_UPLOADS_BATCH_SIZE) {
      await Promise.all(pendingUploads);
      pendingUploads = [];
    }
  }

  if (pendingUploads.length > 0) {
    await Promise.all(pendingUploads);
  }
};

export const useProductsBatchUpload = (searchProvider: AlgoliaSearchProvider | null) => {
  const { uploadState, incrementTotal, incrementCurrent, finishingUpload, startUploading } =
    useUploadState();
  const { getChannels, getProductsByChannel } = useGraphQLClient();

  const uploadBatch = async (products: Products) => {
    if (!searchProvider) return;

    await searchProvider.updatedBatchProducts(products);
    incrementCurrent(products.length);
  };

  const startUpload = async () => {
    if (!searchProvider) return;

    startUploading();

    const channelsResponse = await getChannels();
    const channels = channelsResponse.data?.channels;

    if (channels) {
      for (const channel of channels) {
        await runBatchedUpload(getProductsByChannel(channel.slug), uploadBatch, incrementTotal);
      }
    }

    finishingUpload();
  };

  return { startUpload, uploadState };
};

export const useCategoriesBatchUpload = (searchProvider: AlgoliaSearchProvider | null) => {
  const { uploadState, incrementTotal, incrementCurrent, finishingUpload, startUploading } =
    useUploadState();
  const { getCategories } = useGraphQLClient();

  const uploadBatch = async (categories: Categories) => {
    if (!searchProvider) return;

    await searchProvider.updatedBatchCategories(categories);
    incrementCurrent(categories.length);
  };

  const startUpload = async () => {
    if (!searchProvider) return;

    startUploading();
    await runBatchedUpload(getCategories(), uploadBatch, incrementTotal);
    finishingUpload();
  };

  return { startUpload, uploadState };
};

export const usePagesBatchUpload = (
  searchProvider: AlgoliaSearchProvider | null,
  pageTypeIds: string[] = [],
) => {
  const { uploadState, incrementTotal, incrementCurrent, finishingUpload, startUploading } =
    useUploadState();
  const { getPages } = useGraphQLClient();

  const uploadBatch = async (pages: Pages) => {
    if (!searchProvider) return;

    await searchProvider.updatedBatchPages(pages);
    incrementCurrent(pages.length);
  };

  const startUpload = async () => {
    if (!searchProvider) return;

    startUploading();
    await runBatchedUpload(getPages(pageTypeIds), uploadBatch, incrementTotal);
    finishingUpload();
  };

  return { startUpload, uploadState };
};
