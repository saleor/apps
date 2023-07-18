import Strapi from "strapi-sdk-js";
import { StrapiProviderConfig } from "@/modules/configuration";
import { WebhookProductVariantFragment } from "../../../../generated/graphql";
import { z } from "zod";
import { createLogger } from "@saleor/apps-shared";

// partial response
const strapiFindOperationResult = z.object({
  data: z.array(
    z.object({
      id: z.number(),
    })
  ),
});

// todo error handling, tests
export class StrapiClient {
  private client: Strapi;
  private logger = createLogger({ name: "StrapiClient" });

  constructor(options: { url: string; token: string }) {
    this.client = new Strapi({
      url: options.url,
      axiosOptions: {
        headers: {
          Authorization: `Bearer ${options.token}`,
        },
      },
    });
  }

  private getProducts(configuration: StrapiProviderConfig.FullShape, saleorVariantId: string) {
    return this.client
      .find(configuration.itemType, {
        filters: {
          [configuration.productVariantFieldsMapping.variantId]: {
            $eq: saleorVariantId,
          },
        },
      })
      .then((response) => {
        const parsedResponse = strapiFindOperationResult.parse(response);

        if (!parsedResponse.data.length) {
          return null; // product was not found, maybe it was not indexed first
        }

        return parsedResponse.data;
      });
  }

  async deleteProduct({
    configuration,
    variant,
  }: {
    configuration: StrapiProviderConfig.FullShape;
    variant: WebhookProductVariantFragment;
  }) {
    const strapiProducts = await this.getProducts(configuration, variant.id);

    this.logger.trace({ strapiProducts }, "Fetched products from strapi that will be deleted");

    if (!strapiProducts) {
      return;
    }

    return Promise.all(
      strapiProducts.map((strapiProduct) =>
        this.client.delete(configuration.itemType, strapiProduct.id)
      )
    );
  }

  async uploadProduct({
    configuration,
    variant,
  }: {
    configuration: StrapiProviderConfig.FullShape;
    variant: WebhookProductVariantFragment;
  }) {
    this.logger.trace({ variantId: variant.id }, "Will upload product variant");

    try {
      const result = await this.client.create(configuration.itemType, {
        // todo extract to common mapping function
        [configuration.productVariantFieldsMapping.variantName]: variant.name,
        [configuration.productVariantFieldsMapping.variantId]: variant.id,
        [configuration.productVariantFieldsMapping.productName]: variant.product.name,
        [configuration.productVariantFieldsMapping.productId]: variant.product.id,
        [configuration.productVariantFieldsMapping.channels]: variant.channelListings,
        [configuration.productVariantFieldsMapping.productSlug]: variant.product.slug,
      });

      return result;
    } catch (e) {
      console.error(e);
    }
  }

  async updateProduct({
    configuration,
    variant,
    strapiProductId,
  }: {
    strapiProductId?: number;
    configuration: StrapiProviderConfig.FullShape;
    variant: WebhookProductVariantFragment;
  }) {
    let strapiProductIdsToUpdate = strapiProductId ? [strapiProductId] : null;

    if (!strapiProductIdsToUpdate) {
      const strapiProducts = await this.getProducts(configuration, variant.id);

      if (!strapiProducts) {
        return;
      }

      strapiProductIdsToUpdate = strapiProducts.map((strapiProduct) => strapiProduct.id);
    }

    this.logger.trace({ strapiProductIdsToUpdate }, "Will try to update strapi products");

    try {
      return Promise.all(
        strapiProductIdsToUpdate.map((strapiProductId) => {
          return this.client.update(configuration.itemType, strapiProductId, {
            [configuration.productVariantFieldsMapping.variantName]: variant.name,
            [configuration.productVariantFieldsMapping.variantId]: variant.id,
            [configuration.productVariantFieldsMapping.productName]: variant.product.name,
            [configuration.productVariantFieldsMapping.productId]: variant.product.id,
            [configuration.productVariantFieldsMapping.channels]: variant.channelListings,
            [configuration.productVariantFieldsMapping.productSlug]: variant.product.slug,
          });
        })
      );
    } catch (e) {
      console.error(e);
    }
  }

  async upsertProduct({
    configuration,
    variant,
  }: {
    configuration: StrapiProviderConfig.FullShape;
    variant: WebhookProductVariantFragment;
  }) {
    const strapiProducts = await this.getProducts(configuration, variant.id);

    this.logger.trace({ strapiProducts }, "Will try to upsert strapi products");

    if (strapiProducts) {
      return Promise.all(
        strapiProducts.map((strapiProduct) => {
          return this.updateProduct({ configuration, variant, strapiProductId: strapiProduct.id });
        })
      );
    } else {
      return this.uploadProduct({ configuration, variant });
    }
  }
}
