import { NextApiHandler } from "next";

import { createProtectedHandler } from "@saleor/app-sdk/handlers/next";
import { createLogger } from "../../../../logger";
import { saleorApp } from "../../../../saleor-app";

export const getBaseUrl = (headers: { [name: string]: string | string[] | undefined }): string => {
  const { host, "x-forwarded-proto": protocol = "http" } = headers;

  return `${protocol}://${host}`;
};

const logger = createLogger("MailchimpOAuth");

const handler: NextApiHandler = async (req, res) => {
  if (req.method !== "POST") {
    return res.status(405).send("Should be POST request");
  }

  const appBridgeContext = req.body;

  if (!appBridgeContext.token || !appBridgeContext.saleorApiUrl) {
    return res.status(400).send("Request must container token & saleorApiUrl body params");
  }

  const redirectUri = `${getBaseUrl(req.headers)}/api/auth/mailchimp/callback`;

  logger.debug("Resolved redirect uri", { redirectUri });

  const qs = new URLSearchParams({
    response_type: "code",
    client_id: process.env.MAILCHIMP_CLIENT_ID as string,
    redirect_uri: redirectUri,
  });

  return res.redirect(`https://login.mailchimp.com/oauth2/authorize?${qs.toString()}`);
};

export default createProtectedHandler(handler, saleorApp.apl, ["MANAGE_APPS"]);
