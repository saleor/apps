import Strapi from "strapi-sdk-js";
import { StrapiProviderConfig } from "@/modules/configuration";
import { WebhookProductVariantFragment } from "../../../../generated/graphql";
import { z } from "zod";

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

  private getProduct(configuration: StrapiProviderConfig.FullShape, saleorVariantId: string) {
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

        if (parsedResponse.data.length > 1) {
          // error / sentry, product not unique. delete all?
        }

        return parsedResponse.data[0];
      });
  }

  async deleteProduct({
    configuration,
    variant,
  }: {
    configuration: StrapiProviderConfig.FullShape;
    variant: WebhookProductVariantFragment;
  }) {
    const strapiProduct = await this.getProduct(configuration, variant.id);

    if (strapiProduct) {
      return this.client.delete(configuration.itemType, strapiProduct.id);
    }
  }

  async uploadProduct({
    configuration,
    variant,
  }: {
    configuration: StrapiProviderConfig.FullShape;
    variant: WebhookProductVariantFragment;
  }) {
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
    let strapiProductIdToUpdate = strapiProductId;

    if (!strapiProductIdToUpdate) {
      const strapiProduct = await this.getProduct(configuration, variant.id);

      if (!strapiProduct) {
        return;
      }

      strapiProductIdToUpdate = strapiProduct.id;
    }

    try {
      const result = await this.client.update(configuration.itemType, strapiProductIdToUpdate, {
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

  async upsertProduct({
    configuration,
    variant,
  }: {
    configuration: StrapiProviderConfig.FullShape;
    variant: WebhookProductVariantFragment;
  }) {
    const strapiProduct = await this.getProduct(configuration, variant.id);

    if (strapiProduct) {
      return this.updateProduct({ configuration, variant, strapiProductId: strapiProduct.id });
    } else {
      return this.uploadProduct({ configuration, variant });
    }
  }
}
