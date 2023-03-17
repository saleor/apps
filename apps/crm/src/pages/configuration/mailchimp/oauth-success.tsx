import { NextPage } from "next";
import React, { useEffect } from "react";
import { useRouter } from "next/router";

const ConfigurationPage: NextPage = () => {
  const token = useRouter().query.token;

  useEffect(() => {
    if (token) {
      window.parent.postMessage(JSON.stringify({ type: "mailchimp_token", token })); // todo restrict origin
    }
  }, [token]);

  return <div>config success, token: {token}</div>;
};

export default ConfigurationPage;
