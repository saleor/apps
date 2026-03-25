import { type AlgoliaSearchProvider } from "../../lib/algolia/algoliaSearchProvider";
import { runBatchedUpload } from "./runBatchedUpload";
import { type Pages, useGraphQLClient } from "./useGraphQLClient";
import { useUploadState } from "./useUploadState";

export const usePagesBatchUpload = (searchProvider: AlgoliaSearchProvider | null) => {
  const { uploadState, incrementTotal, incrementCurrent, finishingUpload, startUploading } =
    useUploadState();
  const { getPages } = useGraphQLClient();

  const uploadBatch = async (pages: Pages) => {
    if (!searchProvider) return;

    await searchProvider.updatedBatchPages(pages);
    incrementCurrent(pages.length);
  };

  const startUpload = async (pageTypeIds: string[]) => {
    if (!searchProvider) return;

    startUploading();
    await runBatchedUpload(getPages(pageTypeIds), uploadBatch, incrementTotal);
    finishingUpload();
  };

  return { startUpload, uploadState };
};
