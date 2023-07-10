import { WebhookProductVariantFragment } from "../../../generated/graphql";
import { ContentfulProviderConfigType } from "../configuration";
import { DatocmsProviderConfigType } from "../configuration/schemas/datocms-provider.schema";
import { ProductWebhooksProcessor } from "../webhooks-operations/product-webhooks-processor";
import { DatoCMSClient } from "./datocms-client";

// todo product_updated webhook
export class DatocmsWebhooksProcessor implements ProductWebhooksProcessor {
  private client: DatoCMSClient;

  constructor(private providerConfig: DatocmsProviderConfigType) {
    this.client = new DatoCMSClient({
      apiToken: providerConfig.authToken,
    });
  }

  async onProductVariantUpdated(productVariant: WebhookProductVariantFragment): Promise<void> {
    throw new Error("Not implemented"); // todo
  }
  async onProductVariantCreated(productVariant: WebhookProductVariantFragment): Promise<void> {
    await this.client.uploadProduct({
      configuration: this.providerConfig,
      variant: productVariant,
    });
  }
  async onProductVariantDeleted(productVariant: WebhookProductVariantFragment): Promise<void> {
    throw new Error("Not implemented"); // todo
  }
}
