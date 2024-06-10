import { BuilderIoProviderConfig } from "@/modules/configuration";
import { WebhookProductVariantFragment } from "../../../../generated/graphql";
import { createLogger } from "@/logger";
import { FieldsMapper } from "../fields-mapper";
import { channel } from "diagnostics_channel";

// https://www.builder.io/c/docs/write-api
export class BuilderIoClient {
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
    const logger = createLogger("BuilderIoClient.uploadProductVariant", {
      variantId: variant.id,
      productId: variant.product.id,
      channelsIds: variant.channelListings?.map((channel) => channel.channel.id) || [],
    });

    logger.debug("uploadProductVariant called");

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

      logger.debug("Product variant uploaded");
    } catch (err) {
      logger.error("Failed to upload product variant", { error: err });

      throw err;
    }
  }

  private async updateProductVariantCall(
    builderIoEntryId: string,
    variant: WebhookProductVariantFragment,
  ) {
    const logger = createLogger("BuilderIoClient.updateProductVariantCall", {
      variantId: variant.id,
      builderIoEntryId,
    });

    logger.debug("Update single product variant called");

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

      logger.debug("Product variant updated");
    } catch (err) {
      logger.error("Failed to upload product variant", { error: err });

      throw err;
    }
  }

  async updateProductVariant(variant: WebhookProductVariantFragment) {
    const logger = createLogger("BuilderIoClient.updateProductVariant", {
      variantId: variant.id,
      productId: variant.product.id,
      channelsIds: variant.channelListings?.map((channel) => channel.channel.id) || [],
    });

    logger.debug("Update product variant called");

    const entriesToUpdate = await this.fetchBuilderIoEntryIds(variant.id);

    logger.debug("Trying to update variants in builder.io with following IDs", {
      entriesToUpdate,
    });

    return Promise.all(
      entriesToUpdate.map((id) => {
        return this.updateProductVariantCall(id, variant);
      }),
    );
  }

  async upsertProductVariant(variant: WebhookProductVariantFragment) {
    const logger = createLogger("BuilderIoClient.upsertProductVariant", {
      variantId: variant.id,
      productId: variant.product.id,
      channelsIds: variant.channelListings?.map((channel) => channel.channel.id) || [],
    });

    logger.debug("Upsert product variant called");

    const entriesToUpdate = await this.fetchBuilderIoEntryIds(variant.id);

    if (entriesToUpdate.length === 0) {
      logger.debug("Didn't find any entries to update, will upload new variant");

      return this.uploadProductVariant(variant);
    } else {
      logger.debug("Found entries in builder.io, will update them", { entriesToUpdate });

      return Promise.all(
        entriesToUpdate.map((id) => {
          return this.updateProductVariantCall(id, variant);
        }),
      );
    }
  }

  async deleteProductVariant(variantId: string) {
    const logger = createLogger("BuilderIoClient.deleteProductVariant", {
      variantId,
    });

    logger.debug("Delete product variant called");

    const idsToDelete = await this.fetchBuilderIoEntryIds(variantId);

    logger.debug("Will try to delete items in Builder.io", { ids: idsToDelete });

    return Promise.all(
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
  }

  /**
   * Can return more than 1. Builder doesn't have unique fields.
   */
  private fetchBuilderIoEntryIds(variantId: string): Promise<string[]> {
    const logger = createLogger("BuilderIoClient.deleteProductVariant", {
      modelName: this.config.modelName,
      variantId,
      variantFieldMapping: this.config.productVariantFieldsMapping.variantId,
    });

    logger.debug("Trying to fetch variant from Builder.io");

    return fetch(
      `https://cdn.builder.io/api/v3/content/${this.config.modelName}?apiKey=${this.config.publicApiKey}&query.data.${this.config.productVariantFieldsMapping.variantId}.$eq=${variantId}&limit=10&includeUnpublished=false&cacheSeconds=0`,
    )
      .then((res) => res.json())
      .then((data) => {
        const results = data.results.map((result: any) => result.id) as string[];

        logger.debug("Fetched builder.io entries", { entriesIds: results });
        return results;
      })
      .catch((err) => {
        logger.error("Failed to fetch builder.io entry id", { error: err });
        throw err;
      });
  }
}
