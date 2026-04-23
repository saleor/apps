import { createAppDeletedHandler } from "@saleor/webhook-utils/app-deleted-handler";

import { saleorApp } from "../../../../saleor-app";
import { createLogger } from "../../../logger";

const { handler, getWebhookManifest } = createAppDeletedHandler({
  apl: saleorApp.apl,
  logger: createLogger("APP_DELETED handler"),
  webhookPath: "api/webhooks/app-deleted",

  hooks: {
    onEvent: console.log,
    onAuthDataDeleted: console.log,
    onAuthDataDeleteError: console.log,
  },
});

export { getWebhookManifest };

export default handler;
