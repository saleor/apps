import { NextPage } from "next";
import React, { useEffect } from "react";
import { useRouter } from "next/router";

const ConfigurationPage: NextPage = () => {
  const token = useRouter().query.token;
  const email = useRouter().query.email;

  useEffect(() => {
    if (token) {
      window.parent.postMessage(JSON.stringify({ type: "mailchimp_token", token })); // todo restrict origin
    }
  }, [token]);

  return (
    <div>
      <h1>Success</h1>
      <p>Successfully authorized Mailchimp as {email}</p>
    </div>
  );
};

export default ConfigurationPage;
