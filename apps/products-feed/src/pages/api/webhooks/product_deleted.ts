import { NextWebhookApiHandler, SaleorAsyncWebhook } from "@saleor/app-sdk/handlers/next";
import {
  ProductDeletedDocument,
  ProductWebhookPayloadFragment,
} from "../../../../generated/graphql";
import { saleorApp } from "../../../saleor-app";
import { createLogger } from "@saleor/apps-shared";
import { updateCacheOnWebhook } from "../../../modules/metadata-cache/update-cache-on-webhook";

export const config = {
  api: {
    bodyParser: false,
  },
};

export const webhookProductDeleted = new SaleorAsyncWebhook<ProductWebhookPayloadFragment>({
  webhookPath: "api/webhooks/product_deleted",
  event: "PRODUCT_DELETED",
  apl: saleorApp.apl,
  query: ProductDeletedDocument,
  isActive: true,
});

const logger = createLogger({
  service: "webhook_product_deleted",
});

export const handler: NextWebhookApiHandler<ProductWebhookPayloadFragment> = async (
  req,
  res,
  context
) => {
  await updateCacheOnWebhook({
    authData: context.authData,
    channels: context.payload,
    res,
  });
};

export default webhookProductDeleted.createHandler(handler);
