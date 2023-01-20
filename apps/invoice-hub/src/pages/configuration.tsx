import { NextPage } from "next";
import React, { useEffect } from "react";
import { ChannelsConfiguration } from "../modules/app-configuration/ui/channels-configuration";
import { trpcClient } from "../modules/trpc/trpc-client";
import { useRouter } from "next/router";
import { MainInfo } from "../modules/ui/main-info";

type Tab = "channels";

const ConfigurationPage: NextPage = () => {
  const [activeTab, setActiveTab] = React.useState<Tab>("channels");
  const channels = trpcClient.channels.fetch.useQuery();
  const router = useRouter();

  useEffect(() => {
    if (channels.isSuccess && channels.data.length === 0) {
      router.push("/not-ready");
    }
  }, [channels.data, channels.isSuccess]);

  return (
    <div>
      <h1>Saleor Invoices</h1>
      <MainInfo />

      {/* Enable if more config available */}
      {/*<PageTabs*/}
      {/*  style={{ marginBottom: 20 }}*/}
      {/*  value={activeTab}*/}
      {/*  onChange={(e) => setActiveTab(e as Tab)}*/}
      {/*>*/}
      {/*  <PageTab value="channels" label="Channels configuration" />*/}
      {/*</PageTabs>*/}
      {/*<Divider style={{ marginBottom: 20 }} />*/}

      {activeTab === "channels" && <ChannelsConfiguration />}
    </div>
  );
};

export default ConfigurationPage;
