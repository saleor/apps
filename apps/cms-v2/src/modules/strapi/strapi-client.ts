import Strapi from "strapi-sdk-js";
import { StrapiProviderConfig } from "@/modules/configuration";
import { WebhookProductVariantFragment } from "../../../generated/graphql";

// todo error handling, tests
export class StrapiClient {
  private client: Strapi;

  constructor(options: { url: string; token: string }) {
    this.client = new Strapi({
      url: options.url,
    });

    this.client.setToken(options.token);
  }

  async uploadProduct({
    configuration,
    variant,
  }: {
    configuration: StrapiProviderConfig.FullShape;
    variant: WebhookProductVariantFragment; // todo probably rename fragment not to inclue "webhook" because its used also in other places?  })
  }): Promise<void> {
    const result = await this.client.create(configuration.itemType, {
      [configuration.productVariantFieldsMapping.name]: variant.name,
      [configuration.productVariantFieldsMapping.variantId]: variant.id,
      [configuration.productVariantFieldsMapping.productName]: variant.product.name,
      [configuration.productVariantFieldsMapping.productId]: variant.product.id,
      [configuration.productVariantFieldsMapping.channels]: variant.channelListings, // todo check if shouldnt be stringified
    });
  }
}
