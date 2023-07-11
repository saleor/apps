import { BulkImportProductFragment } from "../../../generated/graphql";
import { AnyProviderConfigSchemaType, ContentfulProviderConfigType } from "../configuration";
import { DatocmsProviderConfigType } from "../configuration/schemas/datocms-provider.schema";
import { ContentfulClient } from "../contentful/contentful-client";
import { contentfulRateLimiter } from "../contentful/contentful-rate-limiter";
import { DatoCMSClientBrowser } from "../datocms/datocms-client-browser";

type Hooks = {
  onUploadStart?: (context: { variantId: string }) => void;
  onUploadSuccess?: (context: { variantId: string }) => void;
  onUploadError?: (context: { variantId: string; error: Error }) => void;
};

interface BulkSyncProcessor {
  uploadProducts(products: BulkImportProductFragment[], hooks: Hooks): Promise<void>;
}

// todo extract
export class ContentfulBulkSyncProcessor implements BulkSyncProcessor {
  constructor(private config: ContentfulProviderConfigType) {}

  async uploadProducts(products: BulkImportProductFragment[], hooks: Hooks): Promise<void> {
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

// todo extract
export class DatocmsBulkSyncProcessor implements BulkSyncProcessor {
  constructor(private config: DatocmsProviderConfigType) {}

  async uploadProducts(products: BulkImportProductFragment[], hooks: Hooks): Promise<void> {
    const client = new DatoCMSClientBrowser({
      apiToken: this.config.authToken,
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
            console.log(r);

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

export const BulkSyncProcessorFactory = {
  create(config: AnyProviderConfigSchemaType): BulkSyncProcessor {
    switch (config.type) {
      case "contentful":
        return new ContentfulBulkSyncProcessor(config);
      case "datocms":
        return new DatocmsBulkSyncProcessor(config);
      default:
        throw new Error(`Unknown provider`);
    }
  },
};
