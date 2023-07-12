import Strapi from "strapi-sdk-js";
import { StrapiProviderConfig } from "@/modules/configuration";
import { WebhookProductVariantFragment } from "../../../generated/graphql";

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

  async uploadProduct({
    configuration,
    variant,
  }: {
    configuration: StrapiProviderConfig.FullShape;
    variant: WebhookProductVariantFragment; // todo probably rename fragment not to inclue "webhook" because its used also in other places?  })
  }): Promise<void> {
    try {
      console.log(configuration);

      const result = await this.client.create(configuration.itemType, {
        // todo extract to common mapping function
        [configuration.productVariantFieldsMapping.name]: variant.name,
        [configuration.productVariantFieldsMapping.variantId]: variant.id,
        [configuration.productVariantFieldsMapping.productName]: variant.product.name,
        [configuration.productVariantFieldsMapping.productId]: variant.product.id,
        [configuration.productVariantFieldsMapping.channels]: variant.channelListings,
        [configuration.productVariantFieldsMapping.productSlug]: variant.product.slug,
      });

      console.log(result);
    } catch (e) {
      console.error(e);
    }
  }
}
