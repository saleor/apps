import { NextPage } from "next";
import React from "react";
import { useRouter } from "next/router";
import { ConfigurationPageBaseLayout } from "../../../modules/ui/configuration-page-base-layout";
import { MjmlConfigurationTab } from "../../../modules/mjml/configuration/ui/mjml-configuration-tab";

const MjmlConfigurationPage: NextPage = () => {
  const router = useRouter();
  const configurationId = router.query.configurationId
    ? router.query.configurationId[0] // optional routes are passed as an array
    : undefined;
  return (
    <ConfigurationPageBaseLayout>
      <MjmlConfigurationTab configurationId={configurationId} />
    </ConfigurationPageBaseLayout>
  );
};

export default MjmlConfigurationPage;
