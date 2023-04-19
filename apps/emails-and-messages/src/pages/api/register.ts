import { createAppRegisterHandler } from "@saleor/app-sdk/handlers/next";

import { saleorApp } from "../../saleor-app";
import { createClient } from "../../lib/create-graphql-client";
import { logger } from "../../lib/logger";
import { getBaseUrl } from "../../lib/get-base-url";
import { registerNotifyWebhook } from "../../lib/register-notify-webhook";

const allowedUrlsPattern = process.env.ALLOWED_DOMAIN_PATTERN;

/**
 * Required endpoint, called by Saleor to install app.
 * It will exchange tokens with app, so saleorApp.apl will contain token
 */
export default createAppRegisterHandler({
  apl: saleorApp.apl,
  allowedSaleorUrls: [
    (url) => {
      if (allowedUrlsPattern) {
        const regex = new RegExp(allowedUrlsPattern);

        return regex.test(url);
      }

      return true;
    },
  ],
  onAuthAplSaved: async (request, ctx) => {
    // Subscribe to Notify using the mutation since it does not use subscriptions and can't be subscribed via manifest
    logger.debug("onAuthAplSaved executing");

    const baseUrl = getBaseUrl(request.headers);
    const client = createClient(ctx.authData.saleorApiUrl, async () =>
      Promise.resolve({ token: ctx.authData.token })
    );
    await registerNotifyWebhook({
      client: client,
      baseUrl: baseUrl,
    });
    logger.debug("Webhook registered");
  },
});
