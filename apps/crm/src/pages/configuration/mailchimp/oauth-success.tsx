import { NextPage } from "next";
import React from "react";
import { useRouter } from "next/router";
import { getCookie } from "cookies-next";

const ConfigurationPage: NextPage = () => {
  const token = getCookie("mailchimp-token");

  return <div>config success, token: {token}</div>;
};

export default ConfigurationPage;
