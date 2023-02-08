import { SaleorAsyncWebhook } from "@saleor/app-sdk/handlers/next";
import { ProductEditedDocument, ProductEditedSubscription } from "../../../../../generated/graphql";
import { saleorApp } from "../../../../../saleor-app";
import { handler } from "./_index";

export const config = {
  api: {
    bodyParser: false,
  },
};

export const webhookProductVariantDeleted = new SaleorAsyncWebhook<
  ProductEditedSubscription["event"]
>({
  webhookPath: "api/webhooks/saleor/product_variant_deleted",
  asyncEvent: "PRODUCT_VARIANT_DELETED",
  apl: saleorApp.apl,
  subscriptionQueryAst: ProductEditedDocument,
});

export default webhookProductVariantDeleted.createHandler(handler);
