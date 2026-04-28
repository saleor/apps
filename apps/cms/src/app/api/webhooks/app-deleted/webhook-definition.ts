import { createAppDeletedHandler } from "@saleor/webhook-utils/app-deleted-handler";

import { saleorApp } from "@/saleor-app";

import { createLogger } from "../../../../logger";

export const appDeletedWebhook = createAppDeletedHandler({
  apl: saleorApp.apl,
  logger: createLogger("APP_DELETED handler"),
  webhookPath: "api/webhooks/app-deleted",
});
