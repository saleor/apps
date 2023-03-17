import { NextPage } from "next";
import { LoginWithMailchimpButton } from "../../../modules/ui/login-with-mailchimp-button/login-with-mailchimp-button";
import React from "react";

const MailchimpAuthPage: NextPage = () => {
  return (
    <div>
      <a href="/api/auth/mailchimp">
        <LoginWithMailchimpButton />
      </a>
    </div>
  );
};

export default MailchimpAuthPage;
