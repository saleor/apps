import { SaleorAsyncWebhook } from "@saleor/app-sdk/handlers/next";

import { PageCreatedDocument } from "../../../generated/graphql";
import { saleorApp } from "../../../saleor-app";
import { type PageCreated } from "../../lib/webhook-event-types";

export const webhookPageCreated = new SaleorAsyncWebhook<PageCreated>({
  webhookPath: "api/webhooks/saleor/page_created",
  event: "PAGE_CREATED",
  apl: saleorApp.apl,
  query: PageCreatedDocument,
  /**
   * Webhook is disabled by default. Will be enabled by the app when configuration succeeds
   */
  isActive: false,
});
