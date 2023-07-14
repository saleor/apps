import { BuilderIoProviderConfig } from "@/modules/configuration";
import { WebhookProductVariantFragment } from "../../../../generated/graphql";

export class BuilderIoClient {
  private endpoint: string;

  constructor(private config: BuilderIoProviderConfig.FullShape) {
    this.endpoint = `https://builder.io/api/v1/write/${config.itemType}`; // todo: rename to MODEL NAME
  }

  private mapVariantToFields(variant: WebhookProductVariantFragment) {
    const { channels, productId, productName, productSlug, variantId, variantName } =
      this.config.productVariantFieldsMapping;

    return {
      [channels]: JSON.stringify(variant.channelListings),
      [productId]: variant.product.id,
      [productName]: variant.product.name,
      [productSlug]: variant.product.slug,
      [variantId]: variant.id,
      [variantName]: variant.name,
    };
  }

  async uploadProductVariant(variant: WebhookProductVariantFragment) {
    return fetch(this.endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${this.config.apiKey}`,
      },
      body: JSON.stringify({
        data: this.mapVariantToFields(variant),
      }),
    });
  }

  async updateProductVariant(variant: WebhookProductVariantFragment) {
    // todo need builder client to fetch product first

    throw new Error("Not implemented");
  }

  async upsertProductVariant(variant: WebhookProductVariantFragment) {
    throw new Error("Not implemented");
  }

  async deleteProductVariant(variantId: string) {
    throw new Error("Not implemented");
  }
}
