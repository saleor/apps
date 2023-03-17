import { NextApiHandler } from "next";
import { MailchimpClientOAuth } from "../../../modules/mailchimp/mailchimp-client";
import { setCookie } from "cookies-next";
import { createLogger } from "../../../lib/logger";

export const getBaseUrl = (headers: { [name: string]: string | string[] | undefined }): string => {
  const { host, "x-forwarded-proto": protocol = "http" } = headers;
  return `${protocol}://${host}`;
};

const handler: NextApiHandler = async (req, res) => {
  const baseUrl = getBaseUrl(req.headers);

  const logger = createLogger({ url: req.url });

  const code = req.query.code as string;

  logger.debug({ baseUrl, code }, "auth/callback called");

  const tokenResponse = await fetch("https://login.mailchimp.com/oauth2/token", {
    method: "POST",
    body: new URLSearchParams({
      grant_type: "authorization_code",
      client_id: process.env.MAILCHIMP_CLIENT_ID as string,
      client_secret: process.env.MAILCHIMP_CLIENT_SECRET as string,
      redirect_uri: `${baseUrl}/api/auth/callback`,
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
  console.log(metadata);

  const mc = new MailchimpClientOAuth(metadata.dc, access_token);

  await mc.ping().then(console.log);

  setCookie("mailchimp-token", access_token, { req, res, maxAge: 60 * 60 });

  return res.redirect(`/configuration/mailchimp/oauth-success`);
};

export default handler;
