import { BulkImportProductFragment } from "../../../generated/graphql";

export type BulkSyncProcessorHooks = {
  onUploadStart?: (context: { variantId: string }) => void;
  onUploadSuccess?: (context: { variantId: string }) => void;
  onUploadError?: (context: { variantId: string; error: Error }) => void;
};

export interface BulkSyncProcessor {
  uploadProducts(
    products: BulkImportProductFragment[],
    hooks: BulkSyncProcessorHooks
  ): Promise<void>;
}
