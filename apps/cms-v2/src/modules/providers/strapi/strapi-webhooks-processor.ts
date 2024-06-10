import { createLogger } from "@/logger";
import {
  WebhookProductFragment,
  WebhookProductVariantFragment,
} from "../../../../generated/graphql";
import { StrapiProviderConfig } from "../../configuration/schemas/strapi-provider.schema";
import { ProductWebhooksProcessor } from "../../webhooks-operations/product-webhooks-processor";
import { StrapiClient } from "./strapi-client";

export class StrapiWebhooksProcessor implements ProductWebhooksProcessor {
  private client: StrapiClient;

  constructor(private config: StrapiProviderConfig.FullShape) {
    this.client = new StrapiClient({ url: config.url, token: config.authToken });
  }

  async onProductVariantUpdated(productVariant: WebhookProductVariantFragment): Promise<void> {
    const logger = createLogger("StrapiWebhooksProcessor.onProductVariantUpdated", {
      variantId: productVariant.id,
      productId: productVariant.product.id,
    });

    logger.debug("Calling product variant update");

    await this.client.updateProduct({ configuration: this.config, variant: productVariant });

    logger.info("Product variant updated");
  }
  async onProductVariantCreated(productVariant: WebhookProductVariantFragment): Promise<void> {
    const logger = createLogger("StrapiWebhooksProcessor.onProductVariantCreated", {
      variantId: productVariant.id,
      productId: productVariant.product.id,
    });

    logger.debug("Calling product variant create");

    await this.client.uploadProduct({ configuration: this.config, variant: productVariant });

    logger.info("Product variant created");
  }
  async onProductVariantDeleted(productVariant: WebhookProductVariantFragment): Promise<void> {
    const logger = createLogger("StrapiWebhooksProcessor.onProductVariantDeleted", {
      variantId: productVariant.id,
      productId: productVariant.product.id,
    });

    logger.debug("onProductVariantDeleted called", {
      variantId: productVariant.id,
      productId: productVariant.product.id,
    });

    await this.client.deleteProduct({ configuration: this.config, variant: productVariant });

    logger.info("Product variant deleted");
  }

  async onProductUpdated(product: WebhookProductFragment): Promise<void> {
    const logger = createLogger("StrapiWebhooksProcessor.onProductVariantDeleted", {
      productId: product.id,
      variantsLength: product.variants?.length,
    });

    logger.debug("Calling product update");

    await Promise.all(
      (product.variants ?? []).map((variant) => {
        return this.client.upsertProduct({
          configuration: this.config,
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
