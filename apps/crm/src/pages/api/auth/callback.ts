import { NextApiHandler } from "next";
import { MailchimpClientOAuth } from "../../../modules/mailchimp/mailchimp-client";

const handler: NextApiHandler = async (req, res) => {
  // const logger = createLogger({ url: req.url });

  const code = req.query.code as string;

  const tokenResponse = await fetch("https://login.mailchimp.com/oauth2/token", {
    method: "POST",
    body: new URLSearchParams({
      grant_type: "authorization_code",
      client_id: process.env.MAILCHIMP_CLIENT_ID as string,
      client_secret: process.env.MAILCHIMP_CLIENT_SECRET as string,
      redirect_uri: "http://127.0.0.1:3000/api/auth/callback", // todo move to env and base url
      code,
    }),
  });

  const { access_token } = await tokenResponse.json();

  const metadataResponse = await fetch("https://login.mailchimp.com/oauth2/metadata", {
    headers: {
      Authorization: `OAuth ${access_token}`,
    },
  });

  const metadata = await metadataResponse.json();
  console.log(metadata);

  const mc = new MailchimpClientOAuth(metadata.dc, access_token);

  await mc.ping().then(console.log);

  return res.redirect(`/configuration/mailchimp/oauth-success?token=${access_token}`); // todo maybe move to cookie?
};

export default handler;
