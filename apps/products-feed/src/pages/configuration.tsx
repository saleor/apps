import { NextPage } from "next";
import React from "react";
import { ChannelsConfiguration } from "../modules/app-configuration/ui/channels-configuration";

import { useChannelsExistenceChecking } from "../modules/channels/use-channels-existence-checking";
import { CategoryMapping } from "../modules/category-mapping/ui/category-mapping";

const ConfigurationPage: NextPage = () => {
  useChannelsExistenceChecking();

  return (
    <>
      <ChannelsConfiguration />
      <CategoryMapping />
    </>
  );
};

export default ConfigurationPage;
