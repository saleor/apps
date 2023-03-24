import { NextPage } from "next";
import React, { useEffect } from "react";
import { trpcClient } from "../modules/trpc/trpc-client";
import { useRouter } from "next/router";
import { ConfigurationPageBaseLayout } from "../modules/ui/configuration-page-base-layout";
import { CategoryMapping } from "../modules/category-mapping/ui/category-mapping";

const ConfigurationPage: NextPage = () => {
  const channels = trpcClient.channels.fetch.useQuery();
  const router = useRouter();

  useEffect(() => {
    if (channels.isSuccess && channels.data.length === 0) {
      router.push("/not-ready");
    }
  }, [channels.data, channels.isSuccess]);

  return (
    <ConfigurationPageBaseLayout>
      <CategoryMapping />
    </ConfigurationPageBaseLayout>
  );
};

export default ConfigurationPage;
