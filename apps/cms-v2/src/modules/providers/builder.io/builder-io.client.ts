import { BuilderIoProviderConfig } from "@/modules/configuration";
import { WebhookProductVariantFragment } from "../../../../generated/graphql";
import { createLogger } from "@saleor/apps-shared";

export class BuilderIoClient {
  private endpoint: string;
  private logger = createLogger({ name: "BuilderIoClient" });

  constructor(private config: BuilderIoProviderConfig.FullShape) {
    this.endpoint = `https://builder.io/api/v1/write/${config.itemType}`; // todo: rename to MODEL NAME
  }

  private mapVariantToFields(variant: WebhookProductVariantFragment) {
    const { channels, productId, productName, productSlug, variantId, variantName } =
      this.config.productVariantFieldsMapping;

    return {
      [channels]: variant.channelListings,
      [productId]: variant.product.id,
      [productName]: variant.product.name,
      [productSlug]: variant.product.slug,
      [variantId]: variant.id,
      [variantName]: variant.name,
    };
  }

  async uploadProductVariant(variant: WebhookProductVariantFragment) {
    this.logger.debug({ variantId: variant.id }, "uploadProductVariant called");

    try {
      const response = await fetch(this.endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.config.apiKey}`,
        },
        body: JSON.stringify({
          data: this.mapVariantToFields(variant),
        }),
      });
    } catch (err) {
      this.logger.error(err, "Failed to upload product variant");

      throw err;
    }
  }

  async updateProductVariant(variant: WebhookProductVariantFragment) {
    // todo need builder client to fetch product first

    throw new Error("Not implemented");
  }

  async upsertProductVariant(variant: WebhookProductVariantFragment) {
    return this.uploadProductVariant(variant);
    // todo: update if exists
  }

  async deleteProductVariant(variantId: string) {
    throw new Error("Not implemented");
  }
}
