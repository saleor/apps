import { WebhookProductVariantFragment } from "../../../generated/graphql";

export interface ProductWebhooksProcessor {
  onProductVariantUpdated(productVariant: WebhookProductVariantFragment): Promise<void>;
  onProductVariantCreated(productVariant: WebhookProductVariantFragment): Promise<void>;
  onProductVariantDeleted(productVariant: WebhookProductVariantFragment): Promise<void>;
  // todo product created
}
