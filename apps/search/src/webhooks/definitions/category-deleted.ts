import { SaleorAsyncWebhook } from "@saleor/app-sdk/handlers/next";

import { CategoryDeletedDocument } from "../../../generated/graphql";
import { saleorApp } from "../../../saleor-app";
import { type CategoryDeleted } from "../../lib/webhook-event-types";

export const webhookCategoryDeleted = new SaleorAsyncWebhook<CategoryDeleted>({
  webhookPath: "api/webhooks/saleor/category_deleted",
  event: "CATEGORY_DELETED",
  apl: saleorApp.apl,
  query: CategoryDeletedDocument,
  /**
   * Webhook is disabled by default. Will be enabled by the app when configuration succeeds
   */
  isActive: false,
});
