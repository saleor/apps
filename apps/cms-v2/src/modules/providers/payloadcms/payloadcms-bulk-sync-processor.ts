import { BulkImportProductFragment } from "../../../../generated/graphql";
import { BulkSyncProcessor, BulkSyncProcessorHooks } from "../../bulk-sync/bulk-sync-processor";

import { PayloadCmsProviderConfig } from "@/modules/configuration/schemas/payloadcms-provider.schema";
import { PayloadCMSClient } from "./payloadcms-client";

// todo CORS or proxy
export class PayloadCmsBulkSyncProcessor implements BulkSyncProcessor {
  constructor(private config: PayloadCmsProviderConfig.FullShape) {}

  async uploadProducts(
    products: BulkImportProductFragment[],
    hooks: BulkSyncProcessorHooks,
  ): Promise<void> {
    const client = new PayloadCMSClient();

    products.flatMap(
      (product) =>
        product.variants?.map((variant) => {
          if (hooks.onUploadStart) {
            hooks.onUploadStart({ variantId: variant.id });
          }

          return client
            .upsertProductVariant({
              configuration: this.config,
              variant: {
                id: variant.id,
                name: variant.name,
                channelListings: variant.channelListings,
                product: {
                  id: product.id,
                  name: product.name,
                  slug: product.slug,
                },
              },
            })
            .then((r) => {
              if (hooks.onUploadSuccess) {
                hooks.onUploadSuccess({ variantId: variant.id });
              }
            })
            .catch((e) => {
              if (hooks.onUploadError) {
                hooks.onUploadError({ variantId: variant.id, error: e });
              }
            });
        }),
    );
  }
}
