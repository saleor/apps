import { createAppDeletedHandler } from "@saleor/webhook-utils/app-deleted-handler";

import { createLogger } from "../../../../logger";
import { saleorApp } from "../../../../saleor-app";

export const appDeletedWebhook = createAppDeletedHandler({
  apl: saleorApp.apl,
  logger: createLogger("APP_DELETED handler"),
  webhookPath: "api/webhooks/app-deleted",
});
