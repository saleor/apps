import { NextApiHandler } from "next";
import { createLogger } from "../../../lib/logger";
import { AppBridgePersistence } from "../../../lib/app-bridge-persistence";
import { processSaleorProtectedHandler } from "@saleor/app-sdk/handlers/next";
import { saleorApp } from "../../../saleor-app";
import { SALEOR_API_URL_HEADER, SALEOR_AUTHORIZATION_BEARER_HEADER } from "@saleor/app-sdk/const";

export const getBaseUrl = (headers: { [name: string]: string | string[] | undefined }): string => {
  const { host, "x-forwarded-proto": protocol = "http" } = headers;
  return `${protocol}://${host}`;
};

const logger = createLogger({});

/**
 * TODO This must be protected, possibly cookie must be set to read token and api url to reach apl
 
 */
const handler: NextApiHandler = async (req, res) => {
  if (req.method !== "POST") {
    return res.status(405).send("Should be POST request");
  }

  const appBridgeContext = req.body;

  if (!appBridgeContext.token || !appBridgeContext.saleorApiUrl) {
    return res.status(400).send("Request must container token & saleorApiUrl body params");
  }

  await processSaleorProtectedHandler({
    apl: saleorApp.apl,
    requiredPermissions: ["MANAGE_APPS"],
    // @ts-ignore - todo - allow this in app-sdk, only these headers are required, not entire request
    req: {
      headers: {
        [SALEOR_API_URL_HEADER]: appBridgeContext.saleorApiUrl,
        [SALEOR_AUTHORIZATION_BEARER_HEADER]: appBridgeContext.token,
      },
    },
  }).catch((e) => {
    logger.fatal(e);

    return res.status(401).send("Failed request validation");
  });

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
