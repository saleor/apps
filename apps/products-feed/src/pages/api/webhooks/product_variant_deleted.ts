import { NextWebhookApiHandler, SaleorAsyncWebhook } from "@saleor/app-sdk/handlers/next";
import { createLogger } from "@saleor/apps-shared";
import {
  ProductVariantDeletedDocument,
  ProductVariantWebhookPayloadFragment,
} from "../../../../generated/graphql";
import { saleorApp } from "../../../saleor-app";
import { updateCacheOnWebhook } from "../../../modules/metadata-cache/update-cache-on-webhook";

export const config = {
  api: {
    bodyParser: false,
  },
};

export const webhookProductVariantDeleted =
  new SaleorAsyncWebhook<ProductVariantWebhookPayloadFragment>({
    webhookPath: "api/webhooks/product_variant_deleted",
    event: "PRODUCT_VARIANT_DELETED",
    apl: saleorApp.apl,
    query: ProductVariantDeletedDocument,
    isActive: true,
  });

const logger = createLogger({
  service: "PRODUCT_VARIANT_DELETED",
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

export default webhookProductVariantDeleted.createHandler(handler);
