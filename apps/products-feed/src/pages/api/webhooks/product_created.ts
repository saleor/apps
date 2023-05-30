import { NextWebhookApiHandler, SaleorAsyncWebhook } from "@saleor/app-sdk/handlers/next";
import { createLogger } from "@saleor/apps-shared";
import { saleorApp } from "../../../saleor-app";
import {
  ProductCreatedDocument,
  ProductWebhookPayloadFragment,
} from "../../../../generated/graphql";
import { updateCacheOnWebhook } from "../../../modules/metadata-cache/update-cache-on-webhook";

export const config = {
  api: {
    bodyParser: false,
  },
};

export const webhookProductCreated = new SaleorAsyncWebhook<ProductWebhookPayloadFragment>({
  webhookPath: "api/webhooks/product_created",
  event: "PRODUCT_CREATED",
  apl: saleorApp.apl,
  query: ProductCreatedDocument,
  // todo make it disabled by default, enable when app is configured
  isActive: true,
});

const logger = createLogger({
  service: "webhook-product_created",
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

export default webhookProductCreated.createHandler(handler);
