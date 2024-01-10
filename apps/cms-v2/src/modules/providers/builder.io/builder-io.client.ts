import { BuilderIoProviderConfig } from "@/modules/configuration";
import { WebhookProductVariantFragment } from "../../../../generated/graphql";
import { createLogger } from "@/logger";
import { FieldsMapper } from "../fields-mapper";

// https://www.builder.io/c/docs/write-api
export class BuilderIoClient {
  private endpoint: string;
  private logger = createLogger("BuilderIoClient");

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
    this.logger.debug("uploadProductVariant called", { variantId: variant.id });

    try {
      const response = await fetch(this.endpoint, {
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
    } catch (err) {
      this.logger.error("Failed to upload product variant", { error: err });

      throw err;
    }
  }

  private async updateProductVariantCall(
    builderIoEntryId: string,
    variant: WebhookProductVariantFragment,
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
          published: "published",
        }),
      });
    } catch (err) {
      this.logger.error("Failed to upload product variant", { error: err });

      throw err;
    }
  }

  async updateProductVariant(variant: WebhookProductVariantFragment) {
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
    const entriesToUpdate = await this.fetchBuilderIoEntryIds(variant.id);

    if (entriesToUpdate.length === 0) {
      this.logger.debug("Didn't find any entries to update, will upload new variant");

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
    const idsToDelete = await this.fetchBuilderIoEntryIds(variantId);

    this.logger.debug("Will try to delete items in Builder.io", { ids: idsToDelete });

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
    this.logger.trace("Trying to fetch variant from Builder.io", {
      modelName: this.config.modelName,
      variantID: variantId,
      variantFieldMapping: this.config.productVariantFieldsMapping.variantId,
    });

    return fetch(
      `https://cdn.builder.io/api/v3/content/${this.config.modelName}?apiKey=${this.config.publicApiKey}&query.data.${this.config.productVariantFieldsMapping.variantId}.$eq=${variantId}&limit=10&includeUnpublished=false&cacheSeconds=0`,
    )
      .then((res) => res.json())
      .then((data) => {
        return data.results.map((result: any) => result.id) as string[];
      })
      .catch((err) => {
        this.logger.error("Failed to fetch builder.io entry id", { error: err });
        throw err;
      });
  }
}
