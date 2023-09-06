import { createProtectedHandler, NextProtectedApiHandler } from "@saleor/app-sdk/handlers/next";
import { EncryptedMetadataManager } from "@saleor/app-sdk/settings-manager";

import { createSettingsManager } from "../../lib/metadata";
import { saleorApp } from "../../../saleor-app";
import { createGraphQLClient } from "@saleor/apps-shared";

type ConfigurationKeysType =
  | "PUBLIC_TOKEN"
  | "CUSTOMER_CREATED_METRIC"
  | "FULFILLMENT_CREATED_METRIC"
  | "ORDER_CREATED_METRIC"
  | "ORDER_FULLY_PAID_METRIC";

interface PostRequestBody {
  data: {
    key: ConfigurationKeysType;
    value: string;
  }[];
}

const getAppSettings = async (settingsManager: EncryptedMetadataManager) => [
  {
    key: "CUSTOMER_CREATED_METRIC",
    value: (await settingsManager.get("CUSTOMER_CREATED_METRIC")) ?? "CUSTOMER_CREATED_METRIC",
  },
  {
    key: "FULFILLMENT_CREATED_METRIC",
    value:
      (await settingsManager.get("FULFILLMENT_CREATED_METRIC")) ?? "FULFILLMENT_CREATED_METRIC",
  },
  {
    key: "ORDER_CREATED_METRIC",
    value: (await settingsManager.get("ORDER_CREATED_METRIC")) ?? "ORDER_CREATED_METRIC",
  },
  {
    key: "ORDER_FULLY_PAID_METRIC",
    value: (await settingsManager.get("ORDER_FULLY_PAID_METRIC")) ?? "ORDER_FULLY_PAID_METRIC",
  },
  { key: "PUBLIC_TOKEN", value: await settingsManager.get("PUBLIC_TOKEN") },
];

const handler: NextProtectedApiHandler = async (request, res, ctx) => {
  console.debug("Configuration handler called");

  const {
    authData: { token, saleorApiUrl, appId },
  } = ctx;

  const client = createGraphQLClient({
    saleorApiUrl,
    token,
  });

  const settings = createSettingsManager(client, appId);

  switch (request.method!) {
    case "GET":
      return res.json({
        success: true,
        data: await getAppSettings(settings),
      });
    case "POST": {
      try {
        await settings.set((JSON.parse(request.body) as PostRequestBody).data);

        return res.json({
          success: true,
          data: await getAppSettings(settings),
        });
      } catch (e) {
        console.error(e);

        return res.json({
          success: false,
        });
      }
    }
    default:
      return res.status(405).end();
  }
};

export default createProtectedHandler(handler, saleorApp.apl, ["MANAGE_APPS"]);
