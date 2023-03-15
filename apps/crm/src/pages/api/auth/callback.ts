import { NextRequest } from "next/server";

export const config = {
  runtime: "edge",
};

const handler = async (req: NextRequest) => {
  const { searchParams } = new URL(req.url);

  const code = searchParams.get("code") as string;

  console.log("code");
  console.log(code);

  const tokenResponse = await fetch("https://login.mailchimp.com/oauth2/token", {
    method: "POST",
    body: new URLSearchParams({
      grant_type: "authorization_code",
      client_id: process.env.MAILCHIMP_CLIENT_ID as string,
      client_secret: process.env.MAILCHIMP_CLIENT_SECRET as string,
      redirect_uri: "http://127.0.0.1:3000/api/auth/callback",
      code,
    }),
  });

  const { access_token } = await tokenResponse.json();
  console.log(access_token);
  // save token in metadata

  console.log(req.url);
  console.log(new URL("configuration", req.url));

  return Response.redirect(new URL("/configuration", req.url));
};

export default handler;
