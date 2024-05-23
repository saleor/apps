import { createProtectedHandler, NextProtectedApiHandler } from "@saleor/app-sdk/handlers/next";
import { EncryptedMetadataManager } from "@saleor/app-sdk/settings-manager";
import { wrapWithLoggerContext } from "@saleor/apps-logger/node";

import { withOtel } from "@saleor/apps-otel";
import { ObservabilityAttributes } from "@saleor/apps-otel/src/lib/observability-attributes";
import { createGraphQLClient } from "@saleor/apps-shared";
import { saleorApp } from "../../../saleor-app";
import { createSettingsManager } from "../../lib/metadata";
import { createLogger } from "../../logger";
import { loggerContext } from "../../logger-context";

const logger = createLogger("configurationHandler");

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
  const {
    authData: { token, saleorApiUrl, appId },
  } = ctx;

  loggerContext.set(ObservabilityAttributes.SALEOR_API_URL, saleorApiUrl);

  logger.info("Configuration handler called");

  const client = createGraphQLClient({
    saleorApiUrl,
    token,
  });

  const settings = createSettingsManager(client, appId);

  switch (request.method!) {
    case "GET":
      logger.info("Returing app configuration");

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
        logger.error("Error updating app configuration", { error: e });

        return res.json({
          success: false,
        });
      }
    }
    default:
      return res.status(405).end();
  }
};

export default wrapWithLoggerContext(
  withOtel(createProtectedHandler(handler, saleorApp.apl, ["MANAGE_APPS"]), "/api/configuration"),
  loggerContext,
);
