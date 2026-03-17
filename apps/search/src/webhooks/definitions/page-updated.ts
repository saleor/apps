import { SaleorAsyncWebhook } from "@saleor/app-sdk/handlers/next";

import { PageUpdatedDocument } from "../../../generated/graphql";
import { saleorApp } from "../../../saleor-app";
import { type PageUpdated } from "../../lib/webhook-event-types";

export const webhookPageUpdated = new SaleorAsyncWebhook<PageUpdated>({
  webhookPath: "api/webhooks/saleor/page-updated",
  event: "PAGE_UPDATED",
  apl: saleorApp.apl,
  query: PageUpdatedDocument,
  /**
   * Webhook is disabled by default. Will be enabled by the app when configuration succeeds
   */
  isActive: false,
});
