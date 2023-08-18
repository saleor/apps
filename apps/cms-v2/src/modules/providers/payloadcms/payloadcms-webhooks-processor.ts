import {
  WebhookProductFragment,
  WebhookProductVariantFragment,
} from "../../../../generated/graphql";

import { PayloadCmsProviderConfig } from "@/modules/configuration/schemas/payloadcms-provider.schema";
import { createLogger } from "@saleor/apps-shared";
import { ProductWebhooksProcessor } from "../../webhooks-operations/product-webhooks-processor";

/*
 * todo error handling
 */
export class PayloadCmsWebhooksProcessor implements ProductWebhooksProcessor {
  // private client: DatoCMSClient;
  private logger = createLogger({ name: "PayloadCmsWebhooksProcessor" });

  constructor(private providerConfig: PayloadCmsProviderConfig.FullShape) {}

  async onProductVariantUpdated(productVariant: WebhookProductVariantFragment): Promise<void> {
    this.logger.trace("onProductVariantUpdated called");

    throw new Error("Method not implemented.");
  }

  async onProductVariantCreated(productVariant: WebhookProductVariantFragment): Promise<void> {
    this.logger.trace("onProductVariantCreated called");

    throw new Error("Method not implemented.");
  }
  async onProductVariantDeleted(productVariant: WebhookProductVariantFragment): Promise<void> {
    this.logger.trace("onProductVariantDeleted called");

    throw new Error("Method not implemented.");
  }

  async onProductUpdated(product: WebhookProductFragment): Promise<void> {
    this.logger.trace("onProductUpdated called");

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
  }
}
