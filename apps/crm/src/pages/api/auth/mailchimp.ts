import { NextApiHandler } from "next";
import { createLogger } from "../../../lib/logger";

export const getBaseUrl = (headers: { [name: string]: string | string[] | undefined }): string => {
  const { host, "x-forwarded-proto": protocol = "http" } = headers;
  return `${protocol}://${host}`;
};

const logger = createLogger({});

/**
 * TODO This must be protected, possibly cookie must be set to read token and api url to reach apl
 
 */
const handler: NextApiHandler = (req, res) => {
  const redirectUri = `${getBaseUrl(req.headers)}/api/auth/callback`;
  logger.debug({ redirectUri }, "Resolved redirect uri");

  const qs = new URLSearchParams({
    response_type: "code",
    client_id: process.env.MAILCHIMP_CLIENT_ID as string,
    redirect_uri: redirectUri,
  });

  return res.redirect(`https://login.mailchimp.com/oauth2/authorize?${qs.toString()}`);
};

export default handler;
