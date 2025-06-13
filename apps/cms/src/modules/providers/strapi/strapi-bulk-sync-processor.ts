import { BulkImportProductFragment } from "../../../../generated/graphql";
import { BulkSyncProcessor, BulkSyncProcessorHooks } from "../../bulk-sync/bulk-sync-processor";
import { StrapiProviderConfig } from "../../configuration";
import { StrapiClient } from "./strapi-client";

type VariantToProcess = {
  variant: NonNullable<BulkImportProductFragment["variants"]>[number];
  product: BulkImportProductFragment;
};

export class StrapiBulkSyncProcessor implements BulkSyncProcessor {
  private batchSize = process.env.STRAPI_BATCH_SIZE
    ? parseInt(process.env.STRAPI_BATCH_SIZE, 10)
    : 50;
  private delayBetweenBatches = process.env.STRAPI_MILIS_DELAY_BETWEEN_BATCHES
    ? parseInt(process.env.STRAPI_MILIS_DELAY_BETWEEN_BATCHES, 10)
    : 1_000;

  constructor(private config: StrapiProviderConfig.FullShape) {}

  private createBatches(products: VariantToProcess[]): VariantToProcess[][] {
    const batches: VariantToProcess[][] = [];

    for (let i = 0; i < products.length; i += this.batchSize) {
      batches.push(products.slice(i, i + this.batchSize));
    }

    return batches;
  }

  async uploadProducts(
    products: BulkImportProductFragment[],
    hooks: BulkSyncProcessorHooks,
  ): Promise<void> {
    const client = new StrapiClient({
      token: this.config.authToken,
      url: this.config.url,
    });

    const variantsToProcess = products.flatMap(
      (product) =>
        product.variants?.map((variant) => ({
          variant,
          product,
        })) || [],
    );

    const batches = this.createBatches(variantsToProcess);

    await batches.reduce(async (previousBatch, currentBatch, index) => {
      await previousBatch;

      const batchPromises = currentBatch.map(async ({ variant, product }) => {
        if (hooks.onUploadStart) {
          hooks.onUploadStart({ variantId: variant.id });
        }

        try {
          await client.upsertProduct({
            configuration: this.config,
            variant: {
              id: variant.id,
              name: variant.name,
              channelListings: variant.channelListings,
              sku: variant.sku,
              product: {
                id: product.id,
                name: product.name,
                slug: product.slug,
              },
            },
          });

          if (hooks.onUploadSuccess) {
            hooks.onUploadSuccess({ variantId: variant.id });
          }
        } catch (e) {
          if (hooks.onUploadError) {
            const error = e instanceof Error ? e : new Error(String(e));

            hooks.onUploadError({ variantId: variant.id, error });
          }
        }
      });

      await Promise.all(batchPromises);

      if (index < batches.length - 1) {
        await new Promise((resolve) => setTimeout(resolve, this.delayBetweenBatches));
      }
    }, Promise.resolve());
  }
}
