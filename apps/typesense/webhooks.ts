import { webhookProductCreated } from "./src/webhooks/definitions/product-created";
import { webhookProductDeleted } from "./src/webhooks/definitions/product-deleted";
import { webhookProductUpdated } from "./src/webhooks/definitions/product-updated";
import { webhookProductVariantBackInStock } from "./src/webhooks/definitions/product-variant-back-in-stock";
import { webhookProductVariantCreated } from "./src/webhooks/definitions/product-variant-created";
import { webhookProductVariantDeleted } from "./src/webhooks/definitions/product-variant-deleted";
import { webhookProductVariantOutOfStock } from "./src/webhooks/definitions/product-variant-out-of-stock";
import { webhookProductVariantUpdated } from "./src/webhooks/definitions/product-variant-updated";

export const appWebhooks = [
  webhookProductCreated,
  webhookProductDeleted,
  webhookProductUpdated,
  webhookProductVariantCreated,
  webhookProductVariantDeleted,
  webhookProductVariantUpdated,
  webhookProductVariantOutOfStock,
  webhookProductVariantBackInStock,
];
