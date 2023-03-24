import { NextPage } from "next";
import React from "react";
import { useRouter } from "next/router";
import { ConfigurationPageBaseLayout } from "../../../modules/ui/configuration-page-base-layout";
import { SendgridConfigurationTab } from "../../../modules/sendgrid/configuration/ui/sendgrid-configuration-tab";

const SendgridConfigurationPage: NextPage = () => {
  const router = useRouter();
  const configurationId = router.query.configurationId
    ? router.query.configurationId[0] // optional routes are passed as an array
    : undefined;
  return (
    <ConfigurationPageBaseLayout>
      <SendgridConfigurationTab configurationId={configurationId} />
    </ConfigurationPageBaseLayout>
  );
};

export default SendgridConfigurationPage;
