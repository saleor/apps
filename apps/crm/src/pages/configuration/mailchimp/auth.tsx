import { NextPage } from "next";
import React from "react";
import { MailchimpAuth } from "../../../modules/mailchimp/mailchimp-auth/mailchimp-auth";

const MailchimpAuthPage: NextPage = () => {
  return <MailchimpAuth />;
};

export default MailchimpAuthPage;
