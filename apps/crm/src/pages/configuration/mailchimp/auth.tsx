import { NextPage } from "next";
import React from "react";
import { MailchimpAuth } from "../../../modules/mailchimp/mailchimp-auth/mailchimp-auth";
import { NextPageWithLayoutOverwrite } from "../../_app";

const MailchimpAuthPage: NextPageWithLayoutOverwrite = () => {
  return <MailchimpAuth />;
};

MailchimpAuthPage.overwriteLayout = (page) => page;

export default MailchimpAuthPage;
