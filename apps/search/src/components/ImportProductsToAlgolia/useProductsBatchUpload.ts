import { type AlgoliaSearchProvider } from "../../lib/algolia/algoliaSearchProvider";
import { runBatchedUpload } from "./runBatchedUpload";
import { type Products, useGraphQLClient } from "./useGraphQLClient";
import { useUploadState } from "./useUploadState";

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
