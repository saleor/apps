import { SaleorAsyncWebhook } from "@saleor/app-sdk/handlers/next";
import { ProductEditedDocument, ProductEditedSubscription } from "../../../../../generated/graphql";
import { saleorApp } from "../../../../../saleor-app";
import { handler } from "./_index";
export const config = {
  api: {
    bodyParser: false,
  },
};

export const webhookProductVariantCreated = new SaleorAsyncWebhook<
  ProductEditedSubscription["event"]
>({
  webhookPath: "api/webhooks/saleor/product_variant_created",
  asyncEvent: "PRODUCT_VARIANT_CREATED",
  apl: saleorApp.apl,
  subscriptionQueryAst: ProductEditedDocument,
});

export default webhookProductVariantCreated.createHandler(handler);
