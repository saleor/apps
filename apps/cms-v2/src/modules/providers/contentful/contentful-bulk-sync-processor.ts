import { BulkImportProductFragment } from "../../../../generated/graphql";
import { BulkSyncProcessor, BulkSyncProcessorHooks } from "../../bulk-sync/bulk-sync-processor";
import { ContentfulProviderConfig } from "../../configuration";
import { ContentfulClient } from "./contentful-client";
import { contentfulRateLimiter } from "./contentful-rate-limiter";
import { createLogger } from "@/logger";

export class ContentfulBulkSyncProcessor implements BulkSyncProcessor {
  private logger = createLogger("ContentfulBulkSyncProcessor");

  constructor(private config: ContentfulProviderConfig.FullShape) {}

  async uploadProducts(
    products: BulkImportProductFragment[],
    hooks: BulkSyncProcessorHooks,
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
              const resp = Array.isArray(r) ? r[0] : r;

              if (resp?.metadata) {
                if (hooks.onUploadSuccess) {
                  hooks.onUploadSuccess({ variantId: variant.id });
                }
              }
            })
            .catch((e) => {
              this.logger.trace("Error while uploading product to Contentful", { error: e });

              if (hooks.onUploadError) {
                hooks.onUploadError({ variantId: variant.id, error: e });
              }
            });
        });
      });
    });
  }
}
