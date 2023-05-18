import { NextProtectedApiHandler, createProtectedHandler } from "@saleor/app-sdk/handlers/next";
import { saleorApp } from "../../../saleor-app";
import type { NextApiRequest, NextApiResponse } from "next";

import { createClient } from "../../lib/graphql";
import { createSettingsManager } from "../../lib/metadata";
import { getProviderInstancesSettings } from "../../lib/cms/client/settings";
import { pingProviderInstance } from "../../lib/cms/client/clients-execution";
import { createLogger } from "@saleor/apps-shared";

export interface ProviderInstancePingApiPayload {
  providerInstanceId: string;
}

export interface ProviderInstancePingApiResponse {
  success: boolean;
}

const handler: NextProtectedApiHandler = async (
  req: NextApiRequest,
  res: NextApiResponse<ProviderInstancePingApiResponse>,
  context
) => {
  const { authData } = context;
  const { providerInstanceId } = req.body as ProviderInstancePingApiPayload;

  const logger = createLogger({
    endpoint: "ping-provider-instance",
  });

  logger.debug({ providerInstanceId }, "Called endpoint ping-provider-instance");

  if (req.method !== "POST") {
    return res.status(405).json({
      success: false,
    });
  }

  if (!providerInstanceId) {
    return res.status(400).json({
      success: false,
    });
  }

  const client = createClient(authData.saleorApiUrl, async () => ({
    token: authData.token,
  }));
  const settingsManager = createSettingsManager(client);
  const providerInstancesSettingsParsed = await getProviderInstancesSettings(settingsManager);

  const providerInstanceSettings = providerInstancesSettingsParsed[providerInstanceId];

  if (!providerInstanceSettings) {
    logger.debug("Settings not found, returning 400");
    return res.status(400).json({
      success: false,
    });
  }

  try {
    const pingResult = await pingProviderInstance(providerInstanceSettings);

    if (pingResult.ok) {
      return res.status(200).json({
        success: true,
      });
    } else {
      throw pingResult;
    }
  } catch (e) {
    logger.debug(e, "Failed connecting to the CMS");

    return res.status(400).json({
      success: false,
    });
  }
};

export default createProtectedHandler(handler, saleorApp.apl, ["MANAGE_APPS"]);
