import { createSaleorApiUrl } from "@saleor/apps-domain/saleor-api-url";
import { createAppDeletedHandler } from "@saleor/webhook-utils/app-deleted-handler";

import { createLogger } from "@/lib/logger";
import { saleorApp } from "@/lib/saleor-app";
import { appConfigRepo } from "@/modules/app-config/repo/app-config-repo";

export const appDeletedWebhook = createAppDeletedHandler({
  apl: saleorApp.apl,
  logger: createLogger("APP_DELETED handler"),
  webhookPath: "api/webhooks/saleor/app-deleted",
  hooks: {
    async onEvent(ctx) {
      const { authData } = ctx;

      // TODO: Use next.js "waitFor". Make retry strategy or queue. Saleor will not retry this delivery.
      await appConfigRepo.pruneTenant(createSaleorApiUrl(authData.saleorApiUrl));
    },
  },
});
