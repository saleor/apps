import { createLogger } from "@saleor/apps-shared";
import {
  WebhookProductFragment,
  WebhookProductVariantFragment,
} from "../../../../generated/graphql";
import { BuilderIoProviderConfig, ContentfulProviderConfig } from "../../configuration";
import { ProductWebhooksProcessor } from "../../webhooks-operations/product-webhooks-processor";
import { BuilderIoClient } from "./builder-io.client";

export type BuilderioClientStrip = Pick<
  BuilderIoClient,
  "upsertProductVariant" | "deleteProductVariant" | "updateProductVariant"
>;

export type BuilderIoClientFactory = (
  config: BuilderIoProviderConfig.FullShape
) => BuilderioClientStrip;

export class BuilderIoWebhooksProcessor implements ProductWebhooksProcessor {
  private client: BuilderioClientStrip;
  private logger = createLogger({ name: "BuilderIoWebhooksProcessor" });

  constructor(
    providerConfig: BuilderIoProviderConfig.FullShape,
    clientFactory: BuilderIoClientFactory = () => new BuilderIoClient(providerConfig)
  ) {
    this.client = clientFactory(providerConfig);

    this.logger.trace("Created BuilderIoWebhooksProcessor");
  }

  async onProductVariantUpdated(productVariant: WebhookProductVariantFragment): Promise<void> {
    this.logger.debug({ variantId: productVariant.id }, "Called onProductVariantUpdated");

    await this.client.upsertProductVariant(productVariant);
  }

  async onProductVariantCreated(productVariant: WebhookProductVariantFragment): Promise<void> {
    this.logger.debug({ variantId: productVariant.id }, "Called onProductVariantCreated");

    await this.client.upsertProductVariant(productVariant);
  }

  async onProductVariantDeleted(productVariant: WebhookProductVariantFragment): Promise<void> {
    this.logger.debug({ variantId: productVariant.id }, "Called onProductVariantDeleted");

    await this.client.deleteProductVariant(productVariant.id);
  }

  async onProductUpdated(product: WebhookProductFragment): Promise<void> {
    this.logger.debug({ procutId: product.id }, "Called onProductUpdated");

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
      })
    );
  }
}
