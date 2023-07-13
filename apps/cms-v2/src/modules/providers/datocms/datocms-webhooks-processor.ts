import {
  WebhookProductFragment,
  WebhookProductVariantFragment,
} from "../../../../generated/graphql";
import { DatocmsProviderConfig } from "../../configuration/schemas/datocms-provider.schema";
import { ProductWebhooksProcessor } from "../../webhooks-operations/product-webhooks-processor";
import { DatoCMSClient } from "./datocms-client";

/*
 * todo error handling
 */
export class DatocmsWebhooksProcessor implements ProductWebhooksProcessor {
  private client: DatoCMSClient;

  constructor(private providerConfig: DatocmsProviderConfig.FullShape) {
    this.client = new DatoCMSClient({
      apiToken: providerConfig.authToken,
    });
  }

  async onProductVariantUpdated(productVariant: WebhookProductVariantFragment): Promise<void> {
    await this.client.updateProductVariant({
      configuration: this.providerConfig,
      variant: productVariant,
    });
  }
  async onProductVariantCreated(productVariant: WebhookProductVariantFragment): Promise<void> {
    await this.client.uploadProductVariant({
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
        return this.client.upsertProduct({
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
