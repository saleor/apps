import type { NextApiRequest, NextApiResponse } from "next";
import { SettingsManager } from "@saleor/app-sdk/settings-manager";

import { createClient } from "../../lib/graphql";
import { createSettingsManager } from "../../lib/metadata";
import { saleorApp } from "../../../saleor-app";
import { AlgoliaConfigurationFields } from "../../lib/algolia/types";
import { createDebug } from "../../lib/debug";

import { createProtectedHandler, ProtectedHandlerContext } from "@saleor/app-sdk/handlers/next";

const debug = createDebug("/api/configuration");

export interface SettingsApiResponse {
  success: boolean;
  data?: AlgoliaConfigurationFields;
}

const sendResponse = async (
  res: NextApiResponse<SettingsApiResponse>,
  statusCode: number,
  settings: SettingsManager,
  domain: string
) => {
  res.status(statusCode).json({
    success: statusCode === 200,
    data: {
      secretKey: (await settings.get("secretKey", domain)) || "",
      searchKey: (await settings.get("searchKey", domain)) || "",
      appId: (await settings.get("appId", domain)) || "",
      indexNamePrefix: (await settings.get("indexNamePrefix", domain)) || "",
    },
  });
};

export const handler = async (
  req: NextApiRequest,
  res: NextApiResponse,
  ctx: ProtectedHandlerContext
) => {
  debug("Configuration handler received request");

  const {
    authData: { token, saleorApiUrl },
  } = ctx;
  const client = createClient(saleorApiUrl, async () => Promise.resolve({ token: token }));

  const settings = createSettingsManager(client);

  const domain = new URL(saleorApiUrl).host;

  if (req.method === "GET") {
    debug("Returning configuration");
    await sendResponse(res, 200, settings, domain);
    return;
  } else if (req.method === "POST") {
    debug("Updating the configuration");
    const { appId, searchKey, secretKey, indexNamePrefix } = JSON.parse(
      req.body
    ) as AlgoliaConfigurationFields;

    await settings.set([
      { key: "secretKey", value: secretKey || "", domain },
      { key: "searchKey", value: searchKey || "", domain },
      { key: "appId", value: appId || "", domain },
      { key: "indexNamePrefix", value: indexNamePrefix || "", domain },
    ]);
    await sendResponse(res, 200, settings, domain);
    return;
  }
  debug("Method not supported");
  res.status(405).end();
};

export default createProtectedHandler(handler, saleorApp.apl, ["MANAGE_APPS", "MANAGE_PRODUCTS"]);
