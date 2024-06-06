import { createAppRegisterHandler } from "@saleor/app-sdk/handlers/next";
import { saleorApp } from "../../../saleor-app";
import { withOtel } from "@saleor/apps-otel";

const allowedUrlsPattern = process.env.ALLOWED_DOMAIN_PATTERN;

export default withOtel(
  createAppRegisterHandler({
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
  }),
  "api/register",
);
