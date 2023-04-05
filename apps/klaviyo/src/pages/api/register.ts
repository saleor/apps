import { createAppRegisterHandler } from "@saleor/app-sdk/handlers/next";

import { saleorApp } from "../../../saleor-app";

const allowedUrlsPattern = process.env.ALLOWED_DOMAIN_PATTERN;

const handler = createAppRegisterHandler({
  apl: saleorApp.apl,
  /**
   * Prohibit installation from Saleors other than specified by the regex.
   * Regex source is ENV so if ENV is not set, all installations will be allowed.
   */
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

export default handler;
