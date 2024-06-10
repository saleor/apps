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

  constructor(private providerConfig: DatocmsProviderConfig.FullShape) {
    this.client = new DatoCMSClient({
      apiToken: providerConfig.authToken,
    });
  }

  async onProductVariantUpdated(productVariant: WebhookProductVariantFragment): Promise<void> {
    const logger = createLogger("DatocmsWebhooksProcessor.onProductVariantUpdated", {
      variantId: productVariant.id,
      productId: productVariant.product.id,
    });

    logger.debug("Calling update product variant");

    await this.client.updateProductVariant({
      configuration: this.providerConfig,
      variant: productVariant,
    });

    logger.info("Product variant updated");
  }

  async onProductVariantCreated(productVariant: WebhookProductVariantFragment): Promise<void> {
    const logger = createLogger("DatocmsWebhooksProcessor.onProductVariantCreated", {
      variantId: productVariant.id,
      productId: productVariant.product.id,
    });

    logger.debug("Calling upsert product variant");

    await this.client.uploadProductVariant({
      configuration: this.providerConfig,
      variant: productVariant,
    });

    logger.info("Product variant created");
  }
  async onProductVariantDeleted(productVariant: WebhookProductVariantFragment): Promise<void> {
    const logger = createLogger("DatocmsWebhooksProcessor.onProductVariantDeleted", {
      variantId: productVariant.id,
      productId: productVariant.product.id,
    });

    logger.debug("Calling delete product variant");

    await this.client.deleteProductVariant({
      configuration: this.providerConfig,
      variant: productVariant,
    });

    logger.info("Product variant deleted");
  }

  async onProductUpdated(product: WebhookProductFragment): Promise<void> {
    const logger = createLogger("DatocmsWebhooksProcessor.onProductUpdated", {
      productId: product.id,
      variantsLength: product.variants?.length,
    });

    logger.debug("onProductUpdated called", {
      productId: product.id,
      variantsLength: product.variants?.length,
    });

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

    logger.info("Product updated");
  }
}
