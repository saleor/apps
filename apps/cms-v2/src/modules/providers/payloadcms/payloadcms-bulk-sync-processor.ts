import { BulkImportProductFragment } from "../../../../generated/graphql";
import { BulkSyncProcessor, BulkSyncProcessorHooks } from "../../bulk-sync/bulk-sync-processor";

import { PayloadCmsProviderConfig } from "@/modules/configuration/schemas/payloadcms-provider.schema";

export class PayloadCmsBulkSyncProcessor implements BulkSyncProcessor {
  constructor(private config: PayloadCmsProviderConfig.FullShape) {}

  async uploadProducts(
    products: BulkImportProductFragment[],
    hooks: BulkSyncProcessorHooks,
  ): Promise<void> {
    throw new Error("Method not implemented.");
  }
}
