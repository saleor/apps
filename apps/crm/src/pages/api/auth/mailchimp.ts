import { NextRequest } from "next/server";

export const config = {
  runtime: "edge",
};

const handler = (req: NextRequest) => {
  const qs = new URLSearchParams({
    response_type: "code",
    client_id: process.env.MAILCHIMP_CLIENT_ID as string,
    redirect_uri: `http://127.0.0.1:3000/api/auth/callback`, // todo move to env, by default use base url
  });

  return Response.redirect(`https://login.mailchimp.com/oauth2/authorize?${qs.toString()}`);
};

export default handler;
