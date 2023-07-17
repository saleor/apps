import { BulkImportProductFragment } from "../../../../generated/graphql";
import { BulkSyncProcessor, BulkSyncProcessorHooks } from "../../bulk-sync/bulk-sync-processor";
import { BuilderIoProviderConfig } from "../../configuration";
import { BuilderIoClient } from "./builder-io.client";

export class BuilderIoBulkSyncProcessor implements BulkSyncProcessor {
  constructor(private config: BuilderIoProviderConfig.FullShape) {}

  async uploadProducts(
    products: BulkImportProductFragment[],
    hooks: BulkSyncProcessorHooks
  ): Promise<void> {
    const client = new BuilderIoClient(this.config);

    products.flatMap((product) =>
      product.variants?.map((variant) => {
        if (hooks.onUploadStart) {
          hooks.onUploadStart({ variantId: variant.id });
        }

        return client
          .upsertProductVariant({
            id: variant.id,
            name: variant.name,
            channelListings: variant.channelListings,
            product: {
              id: product.id,
              name: product.name,
              slug: product.slug,
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
      })
    );
  }
}
