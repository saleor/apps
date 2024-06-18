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
    this.logger.debug("onProductVariantUpdated called");

    await this.client.upsertProductVariant({
      configuration: this.providerConfig,
      variant: productVariant,
    });

    this.logger.info("Product variant updated");
  }

  async onProductVariantCreated(productVariant: WebhookProductVariantFragment): Promise<void> {
    this.logger.debug("onProductVariantCreated called");

    await this.client.uploadProductVariant({
      configuration: this.providerConfig,
      variant: productVariant,
    });

    this.logger.info("Product variant created");
  }
  async onProductVariantDeleted(productVariant: WebhookProductVariantFragment): Promise<void> {
    this.logger.debug("onProductVariantDeleted called");

    await this.client.deleteProductVariant({
      configuration: this.providerConfig,
      variant: productVariant,
    });

    this.logger.info("Product variant deleted");
  }

  async onProductUpdated(product: WebhookProductFragment): Promise<void> {
    this.logger.debug("onProductUpdated called");

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

    this.logger.info("Product updated");
  }
}
