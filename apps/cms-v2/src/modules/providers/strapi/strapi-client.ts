import Strapi from "strapi-sdk-js";
import { StrapiProviderConfig } from "@/modules/configuration";
import { WebhookProductVariantFragment } from "../../../../generated/graphql";
import { z } from "zod";
import { createLogger } from "@/logger";
import { FieldsMapper } from "../fields-mapper";

// partial response
const strapiFindOperationResult = z.object({
  data: z.array(
    z.object({
      id: z.number(),
    }),
  ),
});

// todo error handling, tests
export class StrapiClient {
  private client: Strapi;

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
    const logger = createLogger("StrapiClient.deleteProduct", {
      variantId: variant.id,
      productId: variant.product.id,
      configId: configuration.id,
    });

    logger.debug("Calling delete prodduct");

    const strapiProducts = await this.getProducts(configuration, variant.id);

    logger.debug("Fetched products from strapi that will be deleted", {
      productIds: strapiProducts?.map((p) => p.id) ?? [],
    });

    if (!strapiProducts) {
      logger.info("No product found in Strapi, skipping deletion");
      return;
    }

    return Promise.all(
      strapiProducts.map((strapiProduct) =>
        this.client.delete(configuration.itemType, strapiProduct.id),
      ),
    );
  }

  async uploadProduct({
    configuration,
    variant,
  }: {
    configuration: StrapiProviderConfig.FullShape;
    variant: WebhookProductVariantFragment;
  }) {
    const logger = createLogger("StrapiClient.uploadProduct", {
      variantId: variant.id,
      productId: variant.product.id,
      configId: configuration.id,
    });

    logger.debug("Calling upload product");

    logger.debug("Fetching mapped field...");

    const mappedFields = FieldsMapper.mapProductVariantToConfigurationFields({
      variant,
      configMapping: configuration.productVariantFieldsMapping,
    });

    logger.debug("Fetched mappedd fieds");

    return this.client.create(configuration.itemType, mappedFields);
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
    const logger = createLogger("StrapiClient.uploadProduct", {
      variantId: variant.id,
      productId: variant.product.id,
      configId: configuration.id,
    });

    logger.debug("Calling update product");

    let strapiProductIdsToUpdate = strapiProductId ? [strapiProductId] : null;

    if (!strapiProductIdsToUpdate) {
      logger.debug("No product id was provided, will try to fetch products from Strapi");
      const strapiProducts = await this.getProducts(configuration, variant.id);

      if (!strapiProducts) {
        logger.info("No product found in Strapi, skipping update");
        return;
      }

      strapiProductIdsToUpdate = strapiProducts.map((strapiProduct) => strapiProduct.id);
    }

    logger.debug("Found products to update", { strapiProductIdsToUpdate });

    const mappedFields = FieldsMapper.mapProductVariantToConfigurationFields({
      variant,
      configMapping: configuration.productVariantFieldsMapping,
    });

    return Promise.all(
      strapiProductIdsToUpdate.map((strapiProductId) => {
        return this.client.update(configuration.itemType, strapiProductId, mappedFields);
      }),
    );
  }

  async upsertProduct({
    configuration,
    variant,
  }: {
    configuration: StrapiProviderConfig.FullShape;
    variant: WebhookProductVariantFragment;
  }) {
    const logger = createLogger("StrapiClient.upsertProduct", {
      variantId: variant.id,
      productId: variant.product.id,
      configId: configuration.id,
    });

    logger.debug("Calling upsert product");

    logger.debug("Fetched products from strapi...");

    const strapiProducts = await this.getProducts(configuration, variant.id);

    if (strapiProducts) {
      logger.debug("Found products to upsert", {
        strapiProducts: strapiProducts.map((p) => p.id),
      });

      return Promise.all(
        strapiProducts.map((strapiProduct) => {
          return this.updateProduct({ configuration, variant, strapiProductId: strapiProduct.id });
        }),
      );
    } else {
      logger.debug("No products found, will try to upload");
      return this.uploadProduct({ configuration, variant });
    }
  }
}
