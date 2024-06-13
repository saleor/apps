import { createLogger } from "@/logger";
import {
  WebhookProductFragment,
  WebhookProductVariantFragment,
} from "../../../../generated/graphql";
import { BuilderIoProviderConfig } from "../../configuration";
import { ProductWebhooksProcessor } from "../../webhooks-operations/product-webhooks-processor";
import { BuilderIoClient } from "./builder-io.client";

export type BuilderioClientStrip = Pick<
  BuilderIoClient,
  "upsertProductVariant" | "deleteProductVariant" | "updateProductVariant"
>;

export type BuilderIoClientFactory = (
  config: BuilderIoProviderConfig.FullShape,
) => BuilderioClientStrip;

export class BuilderIoWebhooksProcessor implements ProductWebhooksProcessor {
  private client: BuilderioClientStrip;
  private logger = createLogger("BuilderIoWebhooksProcessor");

  constructor(
    providerConfig: BuilderIoProviderConfig.FullShape,
    clientFactory: BuilderIoClientFactory = () => new BuilderIoClient(providerConfig),
  ) {
    this.client = clientFactory(providerConfig);

    this.logger.debug("Created BuilderIoWebhooksProcessor");
  }

  async onProductVariantUpdated(productVariant: WebhookProductVariantFragment): Promise<void> {
    this.logger.debug("Called onProductVariantUpdated", {
      variantId: productVariant.id,
      variantName: productVariant.name,
      channelsIds: productVariant.channelListings?.map((c) => c.channel.id) || [],
      productId: productVariant.product.id,
    });

    await this.client.upsertProductVariant(productVariant);

    this.logger.debug("Product variant updated");
  }

  async onProductVariantCreated(productVariant: WebhookProductVariantFragment): Promise<void> {
    this.logger.debug("Called onProductVariantCreated", {
      variantId: productVariant.id,
      productId: productVariant.product.id,
      variantName: productVariant.name,
      channelsIds: productVariant.channelListings?.map((c) => c.channel.id) || [],
    });

    await this.client.upsertProductVariant(productVariant);

    this.logger.debug("Product variant created");
  }

  async onProductVariantDeleted(productVariant: WebhookProductVariantFragment): Promise<void> {
    this.logger.debug("Called onProductVariantDeleted", {
      variantId: productVariant.id,
      productId: productVariant.product.id,
      variantName: productVariant.name,
      channelsIds: productVariant.channelListings?.map((c) => c.channel.id) || [],
    });

    await this.client.deleteProductVariant(productVariant.id);

    this.logger.debug("Product variant deleted");
  }

  async onProductUpdated(product: WebhookProductFragment): Promise<void> {
    this.logger.debug("Called onProductUpdated", {
      productId: product.id,
      variantsLength: product.variants?.length,
      productName: product.name,
      channelsIds: product.channelListings?.map((c) => c.channel.id) || [],
    });

    await Promise.all(
      (product.variants ?? []).map((variant) => {
        return this.client.updateProductVariant({
          id: variant.id,
          name: variant.name,
          product: {
            id: product.id,
            name: product.name,
            slug: product.slug,
          },
        });
      }),
    );

    this.logger.debug("Product updated");
  }
}
