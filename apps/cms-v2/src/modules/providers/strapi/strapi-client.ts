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
  private logger = createLogger("StrapiClient");

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
    this.logger.debug("Trying to delete product variant", {
      variantId: variant.id,
      productId: variant.product.id,
      fieldMappping: configuration.productVariantFieldsMapping,
      configId: configuration.id,
    });

    const strapiProducts = await this.getProducts(configuration, variant.id);

    this.logger.debug("Fetched products from strapi that will be deleted", { strapiProducts });

    if (!strapiProducts) {
      this.logger.info("No product found in Strapi, skipping deletion");
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
    this.logger.debug("Trying to upload product variant", {
      variantId: variant.id,
      productId: variant.product.id,
      fieldMappping: configuration.productVariantFieldsMapping,
      configId: configuration.id,
    });

    const mappedFields = FieldsMapper.mapProductVariantToConfigurationFields({
      variant,
      configMapping: configuration.productVariantFieldsMapping,
    });

    this.logger.debug("Mapped fields", { mappedFields });

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
    this.logger.debug("Trying to update product variant", {
      variantId: variant.id,
      productId: variant.product.id,
      fieldMappping: configuration.productVariantFieldsMapping,
      configId: configuration.id,
      strapiProductId,
    });

    let strapiProductIdsToUpdate = strapiProductId ? [strapiProductId] : null;

    if (!strapiProductIdsToUpdate) {
      this.logger.debug("No product id was provided, will try to fetch products from Strapi");
      const strapiProducts = await this.getProducts(configuration, variant.id);

      if (!strapiProducts) {
        this.logger.info("No product found in Strapi, skipping update");
        return;
      }

      strapiProductIdsToUpdate = strapiProducts.map((strapiProduct) => strapiProduct.id);
    }

    this.logger.debug("Found products to update", { strapiProductIdsToUpdate });

    const mappedFields = FieldsMapper.mapProductVariantToConfigurationFields({
      variant,
      configMapping: configuration.productVariantFieldsMapping,
    });

    this.logger.debug("Mapped fields", { mappedFields });

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
    this.logger.debug("Will try to upsert product variant", {
      variantId: variant.id,
      productId: variant.product.id,
      fieldMappping: configuration.productVariantFieldsMapping,
      configId: configuration.id,
    });

    this.logger.debug("Fetched products from strapi...");

    const strapiProducts = await this.getProducts(configuration, variant.id);

    if (strapiProducts) {
      this.logger.debug("Found products to upsert", {
        strapiProducts: strapiProducts.map((p) => p.id),
      });

      return Promise.all(
        strapiProducts.map((strapiProduct) => {
          return this.updateProduct({ configuration, variant, strapiProductId: strapiProduct.id });
        }),
      );
    } else {
      this.logger.debug("No products found, will try to upload");
      return this.uploadProduct({ configuration, variant });
    }
  }
}
