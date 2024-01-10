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

    this.logger.trace("Created BuilderIoWebhooksProcessor");
  }

  async onProductVariantUpdated(productVariant: WebhookProductVariantFragment): Promise<void> {
    this.logger.debug("Called onProductVariantUpdated", { variantId: productVariant.id });

    await this.client.upsertProductVariant(productVariant);
  }

  async onProductVariantCreated(productVariant: WebhookProductVariantFragment): Promise<void> {
    this.logger.debug("Called onProductVariantCreated", { variantId: productVariant.id });

    await this.client.upsertProductVariant(productVariant);
  }

  async onProductVariantDeleted(productVariant: WebhookProductVariantFragment): Promise<void> {
    this.logger.debug("Called onProductVariantDeleted", { variantId: productVariant.id });

    await this.client.deleteProductVariant(productVariant.id);
  }

  async onProductUpdated(product: WebhookProductFragment): Promise<void> {
    this.logger.debug("Called onProductUpdated", { productId: product.id });

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
  }
}
