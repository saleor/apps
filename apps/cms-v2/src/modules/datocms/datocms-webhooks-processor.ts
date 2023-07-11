import { WebhookProductFragment, WebhookProductVariantFragment } from "../../../generated/graphql";
import { DatocmsProviderConfigType } from "../configuration/schemas/datocms-provider.schema";
import { ProductWebhooksProcessor } from "../webhooks-operations/product-webhooks-processor";
import { DatoCMSClient } from "./datocms-client";

/*
 * todo product_updated webhook
 * todo error handling
 */
export class DatocmsWebhooksProcessor implements ProductWebhooksProcessor {
  private client: DatoCMSClient;

  constructor(private providerConfig: DatocmsProviderConfigType) {
    this.client = new DatoCMSClient({
      apiToken: providerConfig.authToken,
    });
  }

  async onProductVariantUpdated(productVariant: WebhookProductVariantFragment): Promise<void> {
    await this.client.updateProduct({
      configuration: this.providerConfig,
      variant: productVariant,
    });
  }
  async onProductVariantCreated(productVariant: WebhookProductVariantFragment): Promise<void> {
    await this.client.uploadProduct({
      configuration: this.providerConfig,
      variant: productVariant,
    });
  }
  async onProductVariantDeleted(productVariant: WebhookProductVariantFragment): Promise<void> {
    await this.client.deleteProduct({
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
