import { createProtectedHandler, ProtectedHandlerContext } from "@saleor/app-sdk/handlers/next";
import { NextApiRequest, NextApiResponse } from "next";

import { createClient } from "../../lib/graphql";
import { createSettingsManager } from "../../lib/metadata";
import { saleorApp } from "../../lib/saleor-app";

const WEBHOOK_URL = "WEBHOOK_URL";

interface PostRequestBody {
  data: { key: string; value: string }[];
}

export const handler = async (
  req: NextApiRequest,
  res: NextApiResponse,
  ctx: ProtectedHandlerContext
) => {
  const {
    authData: { token, saleorApiUrl, appId },
  } = ctx;

  const client = createClient(saleorApiUrl, async () => Promise.resolve({ token }));

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
        res.status(400).json({
          success: false,
          message: "Wrong request body",
        });
        return;
      }
      await settings.set({ key: WEBHOOK_URL, value: newWebhookUrl });
      res.status(200).json({
        success: true,
        data: [{ key: WEBHOOK_URL, value: await settings.get(WEBHOOK_URL) }],
      });
      return;
    }
    default:
      res.status(405).end();
  }
};

export default createProtectedHandler(handler, saleorApp.apl, ["MANAGE_APPS", "MANAGE_ORDERS"]);
