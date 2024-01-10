import {
  WebhookProductFragment,
  WebhookProductVariantFragment,
} from "../../../../generated/graphql";

import { PayloadCmsProviderConfig } from "@/modules/configuration/schemas/payloadcms-provider.schema";
import { createLogger } from "@/logger";
import { ProductWebhooksProcessor } from "../../webhooks-operations/product-webhooks-processor";
import { PayloadCMSClient } from "./payloadcms-client";

/*
 * todo error handling
 */
export class PayloadCmsWebhooksProcessor implements ProductWebhooksProcessor {
  private client = new PayloadCMSClient();

  private logger = createLogger("PayloadCmsWebhooksProcessor");

  constructor(private providerConfig: PayloadCmsProviderConfig.FullShape) {}

  async onProductVariantUpdated(productVariant: WebhookProductVariantFragment): Promise<void> {
    this.logger.trace("onProductVariantUpdated called");

    await this.client.upsertProductVariant({
      configuration: this.providerConfig,
      variant: productVariant,
    });
  }

  async onProductVariantCreated(productVariant: WebhookProductVariantFragment): Promise<void> {
    this.logger.trace("onProductVariantCreated called");

    await this.client.uploadProductVariant({
      configuration: this.providerConfig,
      variant: productVariant,
    });
  }
  async onProductVariantDeleted(productVariant: WebhookProductVariantFragment): Promise<void> {
    this.logger.trace("onProductVariantDeleted called");

    await this.client.deleteProductVariant({
      configuration: this.providerConfig,
      variant: productVariant,
    });
  }

  async onProductUpdated(product: WebhookProductFragment): Promise<void> {
    this.logger.trace("onProductUpdated called");

    const client = new PayloadCMSClient();

    await Promise.all(
      (product.variants ?? []).map((variant) => {
        return client.upsertProductVariant({
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
      }),
    );
  }
}
