import { SaleorAsyncWebhook } from "@saleor/app-sdk/handlers/next";

import { CategoryCreatedDocument } from "../../../generated/graphql";
import { saleorApp } from "../../../saleor-app";
import { type CategoryCreated } from "../../lib/webhook-event-types";

export const webhookCategoryCreated = new SaleorAsyncWebhook<CategoryCreated>({
  webhookPath: "api/webhooks/saleor/category_created",
  event: "CATEGORY_CREATED",
  apl: saleorApp.apl,
  query: CategoryCreatedDocument,
  /**
   * Webhook is disabled by default. Will be enabled by the app when configuration succeeds
   */
  isActive: false,
});
