import { NextApiRequest, NextApiResponse } from "next";

export const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const manifest = {
    display_information: {
      name: "Saleor",
      description: "Receive notifications to your Slack channel",
      background_color: "#231e49",
    },
    features: {
      bot_user: {
        display_name: "Saleor",
        always_online: false,
      },
    },
    oauth_config: {
      scopes: {
        bot: ["incoming-webhook"],
      },
    },
    settings: {
      org_deploy_enabled: false,
      socket_mode_enabled: false,
      token_rotation_enabled: false,
    },
  };

  return res.status(200).json(manifest);
};

export default handler;
