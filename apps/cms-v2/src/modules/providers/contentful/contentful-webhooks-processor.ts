import {
  WebhookProductFragment,
  WebhookProductVariantFragment,
} from "../../../../generated/graphql";
import { ContentfulProviderConfig } from "../../configuration";
import { ProductWebhooksProcessor } from "../../webhooks-operations/product-webhooks-processor";
import { ContentfulClient } from "./contentful-client";

export class ContentfulWebhooksProcessor implements ProductWebhooksProcessor {
  private client: ContentfulClient;

  constructor(private providerConfig: ContentfulProviderConfig.FullShape) {
    this.client = new ContentfulClient({
      accessToken: providerConfig.authToken,
      space: providerConfig.spaceId,
    });
  }

  async onProductVariantUpdated(productVariant: WebhookProductVariantFragment): Promise<void> {
    await this.client.upsertProductVariant({
      configuration: this.providerConfig,
      variant: productVariant,
    });
  }
  async onProductVariantCreated(productVariant: WebhookProductVariantFragment): Promise<void> {
    await this.client.upsertProductVariant({
      configuration: this.providerConfig,
      variant: productVariant,
    });
  }
  async onProductVariantDeleted(productVariant: WebhookProductVariantFragment): Promise<void> {
    await this.client.deleteProductVariant({
      configuration: this.providerConfig,
      variant: productVariant,
    });
  }

  async onProductUpdated(product: WebhookProductFragment): Promise<void> {
    await Promise.all(
      (product.variants ?? []).map((variant) => {
        return this.client.upsertProductVariant({
          configuration: this.providerConfig,
          variant: {
            id: variant.id,
            name: variant.name,
            product: {
              id: product.id,
              name: product.name,
              slug: product.slug,
            },
          },
        });
      })
    );
  }
}
