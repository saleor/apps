import { NextPage } from "next";
import React, { useEffect } from "react";
import { useRouter } from "next/router";

const ConfigurationPage: NextPage = () => {
  const token = useRouter().query.token;
  const email = useRouter().query.email;
  const dc = useRouter().query.dc;

  useEffect(() => {
    if (token) {
      const payload = { type: "mailchimp_token", token, dc };

      console.log("Calling post message");

      window.parent.postMessage(JSON.stringify(payload), window.location.origin); // todo restrict origin
    }
  }, [token, dc]);

  return (
    <div>
      <h1>Success</h1>
      <p>Successfully authorized Mailchimp as {email}</p>
    </div>
  );
};

export default ConfigurationPage;
