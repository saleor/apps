import { createAppRegisterHandler } from "@saleor/app-sdk/handlers/next";

import { saleorApp } from "../../saleor-app";
import { updateCacheForConfigurations } from "../../modules/metadata-cache/update-cache-for-configurations";
import { AuthData } from "@saleor/app-sdk/APL";
import { createClient } from "../../lib/create-graphq-client";
import { ChannelsFetcher } from "../../modules/app-configuration/channels/channels-fetcher";

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
});
