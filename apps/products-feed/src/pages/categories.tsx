import { NextPage } from "next";
import React, { useEffect } from "react";
import { trpcClient } from "../modules/trpc/trpc-client";
import { useRouter } from "next/router";
import { ConfigurationPageBaseLayout } from "../modules/ui/configuration-page-base-layout";
import { CategoryMapping } from "../modules/category-mapping/ui/category-mapping";
import { useChannelsExistenceChecking } from "../modules/channels/use-channels-existence-checking";

const ConfigurationPage: NextPage = () => {
  useChannelsExistenceChecking();

  return (
    <ConfigurationPageBaseLayout>
      <CategoryMapping />
    </ConfigurationPageBaseLayout>
  );
};

export default ConfigurationPage;
