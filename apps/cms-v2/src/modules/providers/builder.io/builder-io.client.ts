import { BuilderIoProviderConfig } from "@/modules/configuration";
import { WebhookProductVariantFragment } from "../../../../generated/graphql";
import { createLogger } from "@saleor/apps-shared";

// https://www.builder.io/c/docs/write-api
export class BuilderIoClient {
  private endpoint: string;
  private logger = createLogger({ name: "BuilderIoClient" });

  constructor(private config: BuilderIoProviderConfig.FullShape) {
    this.endpoint = `https://builder.io/api/v1/write/${config.modelName}`; // todo: rename to MODEL NAME
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
          Authorization: `Bearer ${this.config.privateApiKey}`,
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

  private async updateProductVariantCall(
    builderIoEntryId: string,
    variant: WebhookProductVariantFragment
  ) {
    try {
      const response = await fetch(this.endpoint + `/${builderIoEntryId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.config.privateApiKey}`,
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

  async updateProductVariant(builderIoEntryId: string, variant: WebhookProductVariantFragment) {
    // todo fetch id and call updateProductVariantCall
  }

  async upsertProductVariant(variant: WebhookProductVariantFragment) {
    return this.uploadProductVariant(variant);
    // todo: update if exists
  }

  async deleteProductVariant(variantId: string) {
    console.log({ variantId });
    const idToDelete = await this.fetchBuilderIoEntryId(variantId);

    console.log({ idToDelete });

    // todo fech id first
    throw new Error("Not implemented");
  }

  /**
   * Can return more than 1. Builder doesnt have unique fields.
   */
  private fetchBuilderIoEntryId(variantId: string) {
    this.logger.trace(
      {
        modelName: this.config.modelName,
        variantID: variantId,
        variantFieldMapping: this.config.productVariantFieldsMapping.variantId,
      },
      "Trying to fetch variant from Builder.io"
    );

    return fetch(
      `https://cdn.builder.io/api/v3/content/${this.config.modelName}?apiKey=${this.config.publicApiKey}&query.data.${this.config.productVariantFieldsMapping.variantId}.$eq=${variantId}&limit=10&includeUnpublished=true`
    )
      .then((res) => res.json())
      .catch((err) => {
        this.logger.error(err, "Failed to fetch builder.io entry id");
        throw err;
      });
  }
}
