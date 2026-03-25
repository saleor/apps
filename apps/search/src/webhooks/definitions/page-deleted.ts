import { SaleorAsyncWebhook } from "@saleor/app-sdk/handlers/next";

import { PageDeletedDocument } from "../../../generated/graphql";
import { saleorApp } from "../../../saleor-app";
import { type PageDeleted } from "../../lib/webhook-event-types";

export const webhookPageDeleted = new SaleorAsyncWebhook<PageDeleted>({
  webhookPath: "api/webhooks/saleor/page_deleted",
  event: "PAGE_DELETED",
  apl: saleorApp.apl,
  query: PageDeletedDocument,
  /**
   * Webhook is disabled by default. Will be enabled by the app when configuration succeeds
   */
  isActive: false,
});
