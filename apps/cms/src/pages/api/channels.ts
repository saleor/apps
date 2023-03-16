import { createProtectedHandler, NextProtectedApiHandler } from "@saleor/app-sdk/handlers/next";

import type { NextApiRequest, NextApiResponse } from "next";

import { saleorApp } from "../../../saleor-app";
import { CMSSchemaChannels, SingleChannelSchema } from "../../lib/cms/config";
import { createClient } from "../../lib/graphql";
import { createSettingsManager } from "../../lib/metadata";

export type SettingsUpdateApiRequest = SingleChannelSchema;

export interface ChannelsApiResponse {
  success: boolean;
  data?: CMSSchemaChannels;
}

// todo: implement
// const obfuscateSecret = (secret: string) => {
//   return "*".repeat(secret.length - 4) + secret.substring(secret.length - 4);
// };

const handler: NextProtectedApiHandler = async (
  req: NextApiRequest,
  res: NextApiResponse<ChannelsApiResponse>,
  context
) => {
  const { authData } = context;

  const client = createClient(authData.saleorApiUrl, async () => ({
    token: authData.token,
  }));

  const settingsManager = createSettingsManager(client);

  if (req.method === "GET") {
    const settingsManagerValue = await settingsManager.get("channels");

    return res.status(200).json({
      success: true,
      data: settingsManagerValue && JSON.parse(settingsManagerValue),
    });
  } else if (req.method === "POST") {
    const channelSettings = req.body as SingleChannelSchema;

    if (channelSettings) {
      const currentSettings = await settingsManager.get("channels");
      const currentSettingsParsed = currentSettings && JSON.parse(currentSettings);

      const settings = [
        {
          key: "channels",
          value: JSON.stringify({
            ...currentSettingsParsed,
            [channelSettings.channelSlug]: channelSettings,
          }),
        },
      ];

      try {
        await settingsManager.set(settings);

        return res.status(200).json({
          success: true,
          data: {
            ...currentSettingsParsed,
            [channelSettings.channelSlug]: channelSettings,
          },
        });
      } catch (error) {
        return res.status(500).json({ success: false });
      }
    } else {
      console.log("Missing Settings Values");
      return res.status(400).json({ success: false });
    }
  }
  return res.status(405).end();
};

export default createProtectedHandler(handler, saleorApp.apl, ["MANAGE_APPS"]);
