import type { NextApiRequest, NextApiResponse } from "next";
import { SettingsManager } from "@saleor/app-sdk/settings-manager";

import { createSettingsManager } from "../../lib/metadata";
import { saleorApp } from "../../../saleor-app";

import { createProtectedHandler, ProtectedHandlerContext } from "@saleor/app-sdk/handlers/next";
import { createLogger } from "../../lib/logger";
import { AppConfigurationFields } from "../../domain/configuration";
import { AlgoliaSearchProvider } from "../../lib/algolia/algoliaSearchProvider";
import { WebhookActivityTogglerService } from "../../domain/WebhookActivityToggler.service";
import { createGraphQLClient } from "@saleor/apps-shared";

const logger = createLogger({
  handler: "api/configuration",
});

export interface SettingsApiResponse {
  success: boolean;
  data?: AppConfigurationFields;
}

const sendResponse = async (
  res: NextApiResponse<SettingsApiResponse>,
  statusCode: number,
  settings: SettingsManager,
  domain: string
) => {
  const data = {
    secretKey: (await settings.get("secretKey", domain)) || "",
    appId: (await settings.get("appId", domain)) || "",
    indexNamePrefix: (await settings.get("indexNamePrefix", domain)) || "",
  };

  logger.debug(data, "Will return following settings");

  res.status(statusCode).json({
    success: statusCode === 200,
    data,
  });
};

export const handler = async (
  req: NextApiRequest,
  res: NextApiResponse,
  ctx: ProtectedHandlerContext
) => {
  const {
    authData: { token, saleorApiUrl },
  } = ctx;

  logger.debug({ saleorApiUrl }, "handler called");

  const client = createGraphQLClient({
    saleorApiUrl,
    token,
  });

  const settings = createSettingsManager(client);

  const domain = new URL(saleorApiUrl).host;

  if (req.method === "GET") {
    logger.debug("Returning configuration");

    await sendResponse(res, 200, settings, domain);
    return;
  } else if (req.method === "POST") {
    logger.debug("Updating the configuration");

    const { appId, secretKey, indexNamePrefix } = JSON.parse(req.body) as AppConfigurationFields;

    const algoliaClient = new AlgoliaSearchProvider({
      appId,
      apiKey: secretKey,
      indexNamePrefix: indexNamePrefix,
    });

    try {
      logger.debug("Will ping Algolia");
      await algoliaClient.ping();

      logger.debug("Algolia connection is ok. Will save settings");

      await settings.set([
        { key: "secretKey", value: secretKey || "", domain },
        { key: "appId", value: appId || "", domain },
        { key: "indexNamePrefix", value: indexNamePrefix || "", domain },
      ]);

      logger.debug("Settings set");

      const webhooksToggler = new WebhookActivityTogglerService(ctx.authData.appId, client);

      await webhooksToggler.enableOwnWebhooks();

      logger.debug("Webhooks enabled");
    } catch (e) {
      return res.status(400).end();
    }

    await sendResponse(res, 200, settings, domain);

    return;
  }
  logger.error("Method not supported");

  res.status(405).end();
};

export default createProtectedHandler(handler, saleorApp.apl, ["MANAGE_APPS", "MANAGE_PRODUCTS"]);
