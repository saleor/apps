import { webhookProductCreated } from "./src/pages/api/webhooks/saleor/product_created";
import { webhookProductDeleted } from "./src/pages/api/webhooks/saleor/product_deleted";
import { webhookProductUpdated } from "./src/pages/api/webhooks/saleor/product_updated";
import { webhookProductVariantCreated } from "./src/pages/api/webhooks/saleor/product_variant_created";
import { webhookProductVariantDeleted } from "./src/pages/api/webhooks/saleor/product_variant_deleted";
import { webhookProductVariantUpdated } from "./src/pages/api/webhooks/saleor/product_variant_updated";
import { webhookProductVariantOutOfStock } from "./src/pages/api/webhooks/saleor/product_variant_out_of_stock";
import { webhookProductVariantBackInStock } from "./src/pages/api/webhooks/saleor/product_variant_back_in_stock";

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
