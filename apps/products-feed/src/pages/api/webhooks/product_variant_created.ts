import { NextWebhookApiHandler, SaleorAsyncWebhook } from "@saleor/app-sdk/handlers/next";
import {
  ProductVariantCreatedDocument,
  ProductVariantWebhookPayloadFragment,
} from "../../../../generated/graphql";
import { saleorApp } from "../../../saleor-app";
import { createLogger } from "@saleor/apps-shared";
import { updateCacheOnWebhook } from "../../../modules/metadata-cache/update-cache-on-webhook";

export const config = {
  api: {
    bodyParser: false,
  },
};

export const webhookProductVariantCreated =
  new SaleorAsyncWebhook<ProductVariantWebhookPayloadFragment>({
    webhookPath: "api/webhooks/product_variant_created",
    event: "PRODUCT_VARIANT_CREATED",
    apl: saleorApp.apl,
    query: ProductVariantCreatedDocument,
    isActive: true,
  });

const logger = createLogger({
  service: "PRODUCT_VARIANT_CREATED webhook",
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

export default webhookProductVariantCreated.createHandler(handler);
