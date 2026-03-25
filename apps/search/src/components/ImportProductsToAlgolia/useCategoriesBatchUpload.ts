import { type AlgoliaSearchProvider } from "../../lib/algolia/algoliaSearchProvider";
import { runBatchedUpload } from "./runBatchedUpload";
import { type Categories, useGraphQLClient } from "./useGraphQLClient";
import { useUploadState } from "./useUploadState";

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
