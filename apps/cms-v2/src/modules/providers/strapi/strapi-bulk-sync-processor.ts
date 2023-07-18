import { BulkImportProductFragment } from "../../../../generated/graphql";
import { BulkSyncProcessor, BulkSyncProcessorHooks } from "../../bulk-sync/bulk-sync-processor";
import { StrapiProviderConfig } from "../../configuration";
import { StrapiClient } from "./strapi-client";

export class StrapiBulkSyncProcessor implements BulkSyncProcessor {
  constructor(private config: StrapiProviderConfig.FullShape) {}

  async uploadProducts(
    products: BulkImportProductFragment[],
    hooks: BulkSyncProcessorHooks
  ): Promise<void> {
    const client = new StrapiClient({
      token: this.config.authToken,
      url: this.config.url,
    });

    products.flatMap((product) =>
      product.variants?.map((variant) => {
        if (hooks.onUploadStart) {
          hooks.onUploadStart({ variantId: variant.id });
        }

        return client
          .upsertProduct({
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
      })
    );
  }
}
