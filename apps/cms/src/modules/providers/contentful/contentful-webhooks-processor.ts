import { createLogger } from "@/logger";

import {
  WebhookProductFragment,
  WebhookProductVariantFragment,
} from "../../../../generated/graphql";
import { ContentfulProviderConfig } from "../../configuration";
import { ProductWebhooksProcessor } from "../../webhooks-operations/product-webhooks-processor";
import { ContentfulClient } from "./contentful-client";

export type ContentfulClientStrip = Pick<
  ContentfulClient,
  "upsertProductVariant" | "deleteProductVariant"
>;

export type ContentfulClientFactory = (
  config: ContentfulProviderConfig.FullShape,
) => ContentfulClientStrip;

export class ContentfulWebhooksProcessor implements ProductWebhooksProcessor {
  private client: ContentfulClientStrip;
  private logger = createLogger("ContentfulWebhooksProcessor");

  constructor(
    private providerConfig: ContentfulProviderConfig.FullShape,
    clientFactory: ContentfulClientFactory = () =>
      new ContentfulClient({
        accessToken: providerConfig.authToken,
        space: providerConfig.spaceId,
      }),
  ) {
    this.client = clientFactory(providerConfig);
  }

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

    await this.client.upsertProductVariant({
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

  /**
   * TODO Must check channels, otherwise variants that are not available, will be sent to CMS anyway.
   * Probably happens in every provider type.
   * Context of process must include channel-config mapping.
   */
  async onProductUpdated(product: WebhookProductFragment): Promise<void> {
    this.logger.debug("onProductUpdated called");

    await Promise.all(
      (product.variants ?? []).map((variant) => {
        return this.client.upsertProductVariant({
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
