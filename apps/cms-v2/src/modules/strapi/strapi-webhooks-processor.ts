import { WebhookProductFragment, WebhookProductVariantFragment } from "../../../generated/graphql";
import { StrapiProviderConfig } from "../configuration/schemas/strapi-provider.schema";
import { ProductWebhooksProcessor } from "../webhooks-operations/product-webhooks-processor";
import { StrapiClient } from "./strapi-client";

export class StrapiWebhooksProcessor implements ProductWebhooksProcessor {
  private client: StrapiClient;

  constructor(private config: StrapiProviderConfig.FullShape) {
    this.client = new StrapiClient({ url: config.url, token: config.authToken });
  }

  async onProductVariantUpdated(productVariant: WebhookProductVariantFragment): Promise<void> {
    throw new Error("Method not implemented.");
  }
  async onProductVariantCreated(productVariant: WebhookProductVariantFragment): Promise<void> {
    this.client.uploadProduct({ configuration: this.config, variant: productVariant });
  }
  async onProductVariantDeleted(productVariant: WebhookProductVariantFragment): Promise<void> {
    this.client.deleteProduct({ configuration: this.config, variant: productVariant });
  }

  async onProductUpdated(product: WebhookProductFragment): Promise<void> {
    throw new Error("Method not implemented.");
  }
}
