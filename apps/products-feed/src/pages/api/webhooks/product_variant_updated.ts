import { NextWebhookApiHandler, SaleorAsyncWebhook } from "@saleor/app-sdk/handlers/next";
import { createLogger } from "@saleor/apps-shared";
import {
  ProductVariantUpdatedDocument,
  ProductVariantWebhookPayloadFragment,
} from "../../../../generated/graphql";
import { saleorApp } from "../../../saleor-app";
import { updateCacheOnWebhook } from "../../../modules/metadata-cache/update-cache-on-webhook";

export const config = {
  api: {
    bodyParser: false,
  },
};

export const webhookProductVariantUpdated =
  new SaleorAsyncWebhook<ProductVariantWebhookPayloadFragment>({
    webhookPath: "api/webhooks/product_variant_updated",
    event: "PRODUCT_VARIANT_UPDATED",
    apl: saleorApp.apl,
    query: ProductVariantUpdatedDocument,
    isActive: true,
  });

const logger = createLogger({
  service: "webhookProductVariantUpdatedWebhookHandler",
});

export const handler: NextWebhookApiHandler<ProductVariantWebhookPayloadFragment> = async (
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

export default webhookProductVariantUpdated.createHandler(handler);
