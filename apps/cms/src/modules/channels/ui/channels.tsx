import { useEffect, useState } from "react";
import { MergedChannelSchema } from "../../../lib/cms/config";
import { useProviderInstances } from "../../provider-instances/ui/hooks/useProviderInstances";
import { ChannelConfiguration } from "./channel-configuration";
import { ChannelsList } from "./channels-list";
import { useChannels } from "./hooks/useChannels";
import { AppTabs } from "../../ui/app-tabs";
import { makeStyles } from "@saleor/macaw-ui";
import { useProductsVariantsSync } from "../../cms/hooks/useProductsVariantsSync";

const useStyles = makeStyles({
  wrapper: {
    display: "flex",
    flexDirection: "column",
    gap: 16,
  },
});

export const Channels = () => {
  const styles = useStyles();
  const { channels, saveChannel, loading, errors } = useChannels();
  const { providerInstances } = useProviderInstances();

  const [activeChannelSlug, setActiveChannelSlug] = useState<string | null>(
    channels.length ? channels[0].channelSlug : null
  );

  const handleSetActiveChannel = (channel: MergedChannelSchema | null) => {
    setActiveChannelSlug(channel?.channelSlug || null);
  };

  const { sync } = useProductsVariantsSync(activeChannelSlug);

  const activeChannel = channels.find((channel) => channel.channelSlug === activeChannelSlug);

  useEffect(() => {
    if (!activeChannelSlug && channels.length > 0) {
      setActiveChannelSlug(channels[0].channelSlug);
    }
  }, [channels]);

  return (
    <>
      <AppTabs activeTab="channels" />

      <div className={styles.wrapper}>
        <ChannelsList
          channels={channels}
          activeChannel={activeChannel}
          setActiveChannel={handleSetActiveChannel}
          loading={loading}
          errors={errors}
        />
        <ChannelConfiguration
          activeChannel={activeChannel}
          providerInstances={providerInstances}
          saveChannel={saveChannel}
          syncChannelProviderInstance={sync}
          loading={loading}
          errors={errors}
        />
      </div>
    </>
  );
};
