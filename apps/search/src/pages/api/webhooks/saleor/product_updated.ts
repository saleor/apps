import { SaleorAsyncWebhook } from "@saleor/app-sdk/handlers/next";
import { ProductEditedDocument, ProductEditedSubscription } from "../../../../../generated/graphql";
import { saleorApp } from "../../../../../saleor-app";
import { handler } from "./_index";

export const config = {
  api: {
    bodyParser: false,
  },
};

export const webhookProductUpdated = new SaleorAsyncWebhook<ProductEditedSubscription["event"]>({
  webhookPath: "api/webhooks/saleor/product_updated",
  asyncEvent: "PRODUCT_UPDATED",
  apl: saleorApp.apl,
  subscriptionQueryAst: ProductEditedDocument,
});

export default webhookProductUpdated.createHandler(handler);
