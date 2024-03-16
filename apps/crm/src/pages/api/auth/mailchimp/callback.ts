import { NextApiHandler } from "next";
import { MailchimpClientOAuth } from "../../../../modules/mailchimp/mailchimp-client";
import { createLogger } from "@saleor/apps-shared";
import { createProtectedHandler } from "@saleor/app-sdk/handlers/next";
import { saleorApp } from "../../../../saleor-app";

export const getBaseUrl = (headers: { [name: string]: string | string[] | undefined }): string => {
  const { host, "x-forwarded-proto": protocol = "http" } = headers;

  return `${protocol}://${host}`;
};

const handler: NextApiHandler = async (req, res) => {
  const baseUrl = getBaseUrl(req.headers);

  const logger = createLogger({ url: req.url });

  const code = req.query.code as string;

  logger.debug({ baseUrl, code }, "auth/mailchimp/callback called");

  const tokenResponse = await fetch("https://login.mailchimp.com/oauth2/token", {
    method: "POST",
    body: new URLSearchParams({
      grant_type: "authorization_code",
      client_id: process.env.MAILCHIMP_CLIENT_ID as string,
      client_secret: process.env.MAILCHIMP_CLIENT_SECRET as string,
      redirect_uri: `${baseUrl}/api/auth/mailchimp/callback`,
      code,
    }),
  });

  const { access_token } = await tokenResponse.json();

  logger.debug({ access_token }, "Received mailchimp access_token");

  const metadataResponse = await fetch("https://login.mailchimp.com/oauth2/metadata", {
    headers: {
      Authorization: `OAuth ${access_token}`,
    },
  });

  const metadata = await metadataResponse.json();

  const mc = new MailchimpClientOAuth(metadata.dc, access_token);

  await mc.ping();

  return res.redirect(
    `/configuration/mailchimp/oauth-success?token=${access_token}&email=${metadata.login.email}&dc=${metadata.dc}`,
  ); // todo maybe move to cookie
};

export default createProtectedHandler(handler, saleorApp.apl, ["MANAGE_APPS"]);
