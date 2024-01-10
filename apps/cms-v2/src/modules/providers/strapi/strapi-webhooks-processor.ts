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
  private logger = createLogger("StrapiWebhooksProcessor");

  constructor(private config: StrapiProviderConfig.FullShape) {
    this.client = new StrapiClient({ url: config.url, token: config.authToken });
  }

  async onProductVariantUpdated(productVariant: WebhookProductVariantFragment): Promise<void> {
    this.logger.trace("onProductVariantUpdated called");

    this.client.updateProduct({ configuration: this.config, variant: productVariant });
  }
  async onProductVariantCreated(productVariant: WebhookProductVariantFragment): Promise<void> {
    this.logger.trace("onProductVariantCreated called");

    this.client.uploadProduct({ configuration: this.config, variant: productVariant });
  }
  async onProductVariantDeleted(productVariant: WebhookProductVariantFragment): Promise<void> {
    this.logger.trace("onProductVariantDeleted called");

    this.client.deleteProduct({ configuration: this.config, variant: productVariant });
  }

  async onProductUpdated(product: WebhookProductFragment): Promise<void> {
    this.logger.trace("onProductUpdated called");

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
  }
}
