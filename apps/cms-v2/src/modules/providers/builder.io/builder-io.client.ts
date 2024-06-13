import { BuilderIoProviderConfig } from "@/modules/configuration";
import { WebhookProductVariantFragment } from "../../../../generated/graphql";
import { createLogger } from "@/logger";
import { FieldsMapper } from "../fields-mapper";

// https://www.builder.io/c/docs/write-api
export class BuilderIoClient {
  private logger = createLogger("BuilderIoClient");
  private endpoint: string;

  constructor(private config: BuilderIoProviderConfig.FullShape) {
    this.endpoint = `https://builder.io/api/v1/write/${config.modelName}`;
  }

  private mapVariantToFields(variant: WebhookProductVariantFragment) {
    return FieldsMapper.mapProductVariantToConfigurationFields({
      variant,
      configMapping: this.config.productVariantFieldsMapping,
    });
  }

  async uploadProductVariant(variant: WebhookProductVariantFragment) {
    this.logger.debug("uploadProductVariant called", {
      variantId: variant.id,
      productId: variant.product.id,
      variantName: variant.name,
      channelsIds: variant.channelListings?.map((c) => c.channel.id) || [],
    });

    try {
      await fetch(this.endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.config.privateApiKey}`,
        },
        body: JSON.stringify({
          data: this.mapVariantToFields(variant),
          published: "published",
        }),
      });

      this.logger.info("Product variant uploaded");
    } catch (err) {
      this.logger.error("Failed to upload product variant", { error: err });

      throw err;
    }
  }

  private async updateProductVariantCall(
    builderIoEntryId: string,
    variant: WebhookProductVariantFragment,
  ) {
    this.logger.debug("updateProductVariantCall called", {
      variantId: variant.id,
      productId: variant.product.id,
      variantName: variant.name,
      channelsIds: variant.channelListings?.map((c) => c.channel.id) || [],
      builderIoEntryId,
    });

    try {
      await fetch(this.endpoint + `/${builderIoEntryId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.config.privateApiKey}`,
        },
        body: JSON.stringify({
          data: this.mapVariantToFields(variant),
          published: "published",
        }),
      });

      this.logger.info("Product variant updated");
    } catch (err) {
      this.logger.error("Failed to upload product variant", { error: err });

      throw err;
    }
  }

  async updateProductVariant(variant: WebhookProductVariantFragment) {
    this.logger.debug("updateProductVariant called", {
      variantId: variant.id,
      productId: variant.product.id,
      variantName: variant.name,
      channelsIds: variant.channelListings?.map((c) => c.channel.id) || [],
    });

    const entriesToUpdate = await this.fetchBuilderIoEntryIds(variant.id);

    this.logger.debug("Trying to update variants in builder.io with following IDs", {
      entriesToUpdate,
    });

    return Promise.all(
      entriesToUpdate.map((id) => {
        return this.updateProductVariantCall(id, variant);
      }),
    );
  }

  async upsertProductVariant(variant: WebhookProductVariantFragment) {
    this.logger.debug("upsertProductVariant called", {
      variantId: variant.id,
      productId: variant.product.id,
      variantName: variant.name,
      channelsIds: variant.channelListings?.map((c) => c.channel.id) || [],
    });

    const entriesToUpdate = await this.fetchBuilderIoEntryIds(variant.id);

    if (entriesToUpdate.length === 0) {
      this.logger.info("Didn't find any entries to update, will upload new variant");

      return this.uploadProductVariant(variant);
    } else {
      this.logger.debug("Found entries in builder.io, will update them", { entriesToUpdate });

      return Promise.all(
        entriesToUpdate.map((id) => {
          return this.updateProductVariantCall(id, variant);
        }),
      );
    }
  }

  async deleteProductVariant(variantId: string) {
    this.logger.debug("deleteProductVariant called", {
      variantId,
    });

    const idsToDelete = await this.fetchBuilderIoEntryIds(variantId);

    this.logger.debug("Will try to delete items in Builder.io", { ids: idsToDelete });

    const result = await Promise.all(
      idsToDelete.map((id) =>
        fetch(this.endpoint + `/${id}`, {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${this.config.privateApiKey}`,
          },
        }),
      ),
    );

    this.logger.info("Product has been deleted");

    return result;
  }

  /**
   * Can return more than 1. Builder doesn't have unique fields.
   */
  private fetchBuilderIoEntryIds(variantId: string): Promise<string[]> {
    this.logger.debug("fetchBuilderIoEntryIds called", {
      modelName: this.config.modelName,
      variantId,
      variantFieldMapping: this.config.productVariantFieldsMapping.variantId,
    });

    return fetch(
      `https://cdn.builder.io/api/v3/content/${this.config.modelName}?apiKey=${this.config.publicApiKey}&query.data.${this.config.productVariantFieldsMapping.variantId}.$eq=${variantId}&limit=10&includeUnpublished=false&cacheSeconds=0`,
    )
      .then((res) => res.json())
      .then((data) => {
        const results = data.results.map((result: any) => result.id) as string[];

        this.logger.debug("Fetched builder.io entries", { entriesIds: results });
        return results;
      })
      .catch((err) => {
        this.logger.error("Failed to fetch builder.io entry id", { error: err });
        throw err;
      });
  }
}
