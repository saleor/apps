import { createManifestHandler } from "@saleor/app-sdk/handlers/next";
import { AppManifest } from "@saleor/app-sdk/types";

import packageJson from "../../../package.json";

export default createManifestHandler({
  async manifestFactory(context) {
    const manifest: AppManifest = {
      about:
        "Data Importer allows batch import of shop data to Saleor from sources like CSV or Excel",
      appUrl: context.appBaseUrl,
      author: "Saleor Commerce",
      brand: {
        logo: {
          default: `${context.appBaseUrl}/logo.png`,
        },
      },
      dataPrivacyUrl: "https://saleor.io/legal/privacy/",
      extensions: [
        /**
         * Optionally, extend Dashboard with custom UIs
         * https://docs.saleor.io/docs/3.x/developer/extending/apps/extending-dashboard-with-apps
         */
      ],
      homepageUrl: "https://github.com/saleor/apps",
      id: "saleor.app.data-importer",
      name: "Data Importer",
      permissions: ["MANAGE_USERS"],
      supportUrl: "https://github.com/saleor/apps/discussions",
      tokenTargetUrl: `${context.appBaseUrl}/api/register`,
      version: packageJson.version,
      webhooks: [
        /**
         * Configure webhooks here. They will be created in Saleor during installation
         * Read more
         * https://docs.saleor.io/docs/3.x/developer/api-reference/objects/webhook
         */
      ],
    };

    return manifest;
  },
});
