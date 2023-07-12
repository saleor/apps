import { BulkImportProductFragment } from "../../../../generated/graphql";
import { BulkSyncProcessor, BulkSyncProcessorHooks } from "../../bulk-sync/bulk-sync-processor";
import { ContentfulProviderConfigType } from "../../configuration";
import { ContentfulClient } from "./contentful-client";
import { contentfulRateLimiter } from "./contentful-rate-limiter";

export class ContentfulBulkSyncProcessor implements BulkSyncProcessor {
  constructor(private config: ContentfulProviderConfigType) {}

  async uploadProducts(
    products: BulkImportProductFragment[],
    hooks: BulkSyncProcessorHooks
  ): Promise<void> {
    const contentful = new ContentfulClient({
      accessToken: this.config.authToken,
      space: this.config.spaceId,
    });

    products.flatMap((product) => {
      return product.variants?.map((variant) => {
        return contentfulRateLimiter(() => {
          if (hooks.onUploadStart) {
            hooks.onUploadStart({ variantId: variant.id });
          }

          return contentful
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
              if (r?.metadata) {
                if (hooks.onUploadSuccess) {
                  hooks.onUploadSuccess({ variantId: variant.id });
                }
              }
            })
            .catch((e) => {
              console.error(e); // todo logger

              if (hooks.onUploadError) {
                hooks.onUploadError({ variantId: variant.id, error: e });
              }
            });
        });
      });
    });
  }
}
