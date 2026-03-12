import { SaleorAsyncWebhook } from "@saleor/app-sdk/handlers/next";

import { CategoryUpdatedDocument } from "../../../generated/graphql";
import { saleorApp } from "../../../saleor-app";
import { type CategoryUpdated } from "../../lib/webhook-event-types";

export const webhookCategoryUpdated = new SaleorAsyncWebhook<CategoryUpdated>({
  webhookPath: "api/webhooks/saleor/category_updated",
  event: "CATEGORY_UPDATED",
  apl: saleorApp.apl,
  query: CategoryUpdatedDocument,
  /**
   * Webhook is disabled by default. Will be enabled by the app when configuration succeeds
   */
  isActive: false,
});
