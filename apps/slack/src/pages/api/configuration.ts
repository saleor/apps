import { createProtectedHandler, ProtectedHandlerContext } from "@saleor/app-sdk/handlers/next";
import { NextApiRequest, NextApiResponse } from "next";

import { createSettingsManager } from "../../lib/metadata";
import { saleorApp } from "../../lib/saleor-app";
import { createGraphQLClient } from "@saleor/apps-shared";
import { WebhookActivityTogglerService } from "../../lib/WebhookActivityToggler.service";
import { isValidUrl } from "../../lib/is-valid-url";

const WEBHOOK_URL = "WEBHOOK_URL";

interface PostRequestBody {
  data: { key: string; value: string }[];
}

export const handler = async (
  req: NextApiRequest,
  res: NextApiResponse,
  ctx: ProtectedHandlerContext,
) => {
  const {
    authData: { token, saleorApiUrl, appId },
  } = ctx;

  const client = createGraphQLClient({
    saleorApiUrl,
    token,
  });

  const settings = createSettingsManager(client, appId);

  switch (req.method!) {
    case "GET":
      res.status(200).json({
        success: true,
        data: [{ key: WEBHOOK_URL, value: await settings.get(WEBHOOK_URL) }],
      });
      return;
    case "POST": {
      const reqBody = req.body as PostRequestBody;
      const newWebhookUrl = (await reqBody.data?.find((entry) => entry.key === WEBHOOK_URL))?.value;

      if (!newWebhookUrl) {
        console.error("New value for the webhook URL has not been found");

        return res.status(400).json({
          success: false,
          message: "Wrong request body",
        });
      }

      if (!isValidUrl(newWebhookUrl)) {
        return res.status(400).json({
          success: false,
          message: "Invalid webhook URL format",
        });
      }

      await settings.set({ key: WEBHOOK_URL, value: newWebhookUrl });

      /**
       * Enable webhooks. Assume that URL is correct.
       * With better implementation, URL should be validated first (best with Slack API test call).
       */
      await new WebhookActivityTogglerService(appId, client).enableOwnWebhooks();

      return res.status(200).json({
        success: true,
        data: [{ key: WEBHOOK_URL, value: await settings.get(WEBHOOK_URL) }],
      });
    }
    default:
      res.status(405).end();
  }
};

export default createProtectedHandler(handler, saleorApp.apl, ["MANAGE_APPS", "MANAGE_ORDERS"]);
