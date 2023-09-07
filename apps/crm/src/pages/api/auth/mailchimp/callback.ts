import { NextApiHandler } from "next";
import { MailchimpClientOAuth } from "../../../../modules/mailchimp/mailchimp-client";
import { createLogger } from "@saleor/apps-shared";
import { z } from "zod";
import * as Sentry from "@sentry/nextjs";

export const getBaseUrl = (headers: { [name: string]: string | string[] | undefined }): string => {
  const { host, "x-forwarded-proto": protocol = "http" } = headers;

  return `${protocol}://${host}`;
};

const tokenResponseSchema = z.object({
  access_token: z.string().min(1),
});

const metadataResponseSchema = z.object({
  dc: z.string().min(1),
  login: z.object({
    email: z.string().min(1),
  }),
});

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

  let accessToken: string;

  try {
    const tokenResponseJson = await tokenResponse.json();
    const parsedTokenResponse = tokenResponseSchema.parse(tokenResponseJson);

    accessToken = parsedTokenResponse.access_token;
  } catch {
    Sentry.captureException(
      "Mailchimp token response doesnt contain access_token or can't be fetched",
    );

    return res.status(500).end();
  }

  logger.debug({ access_token: accessToken }, "Received mailchimp access_token");

  try {
    const metadataResponse = await fetch("https://login.mailchimp.com/oauth2/metadata", {
      headers: {
        Authorization: `OAuth ${accessToken}`,
      },
    });

    const metadataJson = await metadataResponse.json();

    const parsedMetadata = metadataResponseSchema.parse(metadataJson);

    const mc = new MailchimpClientOAuth(parsedMetadata.dc, accessToken);

    await mc.ping();

    return res.redirect(
      `/configuration/mailchimp/oauth-success?token=${accessToken}&email=${parsedMetadata.login.email}&dc=${parsedMetadata.dc}`,
    );
  } catch {
    Sentry.captureException("Mailchimp oauth metadata cant be fetched or is malformed");

    return res.status(500).end();
  }
};

export default handler;
