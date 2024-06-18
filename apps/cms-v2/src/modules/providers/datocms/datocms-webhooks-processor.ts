import { DatocmsProviderConfig } from "@/modules/configuration/schemas/datocms-provider.schema";
import {
  WebhookProductFragment,
  WebhookProductVariantFragment,
} from "../../../../generated/graphql";

import { ProductWebhooksProcessor } from "../../webhooks-operations/product-webhooks-processor";
import { DatoCMSClient } from "./datocms-client";
import { createLogger } from "@/logger";

/*
 * todo error handling
 */
export class DatocmsWebhooksProcessor implements ProductWebhooksProcessor {
  private client: DatoCMSClient;
  private logger = createLogger("DatocmsWebhooksProcessor");

  constructor(private providerConfig: DatocmsProviderConfig.FullShape) {
    this.client = new DatoCMSClient({
      apiToken: providerConfig.authToken,
    });
  }

  async onProductVariantUpdated(productVariant: WebhookProductVariantFragment): Promise<void> {
    this.logger.debug("onProductVariantUpdated called");

    await this.client.updateProductVariant({
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
      }),
    );

    this.logger.info("Product updated");
  }
}
