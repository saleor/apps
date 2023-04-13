import { makeStyles } from "@saleor/macaw-ui";
import { useEffect, useState } from "react";
import { MergedChannelSchema, SingleChannelSchema } from "../../../lib/cms/config";
import {
  useProductsVariantsSync,
  ProductsVariantsSyncOperation,
} from "../../cms/hooks/useProductsVariantsSync";
import { useProviderInstances } from "../../provider-instances/ui/hooks/useProviderInstances";
import { AppTabs } from "../../ui/app-tabs";
import { ChannelConfiguration } from "./channel-configuration";
import { ChannelsList } from "./channels-list";
import { useChannels } from "./hooks/useChannels";
import { ChannelsLoading } from "./types";

const useStyles = makeStyles({
  wrapper: {
    display: "flex",
    flexDirection: "column",
    gap: 16,
  },
});

export const Channels = () => {
  const styles = useStyles();
  const { channels, saveChannel, loading: loadingChannels, errors } = useChannels();
  const { providerInstances } = useProviderInstances();

  const [activeChannelSlug, setActiveChannelSlug] = useState<string | null>(
    channels.length ? channels[0].channelSlug : null
  );

  const handleSetActiveChannel = (channel: MergedChannelSchema | null) => {
    setActiveChannelSlug(channel?.channelSlug || null);
  };

  const activeChannel = channels.find((channel) => channel.channelSlug === activeChannelSlug);

  useEffect(() => {
    if (!activeChannelSlug && channels.length > 0) {
      setActiveChannelSlug(channels[0].channelSlug);
    }
  }, [channels]);

  const handleOnSyncCompleted = (providerInstanceId: string, error?: string) => {
    if (!activeChannel) {
      return;
    }

    if (error) {
      return;
    }

    saveChannel({
      ...activeChannel,
      requireSyncProviderInstances: activeChannel.requireSyncProviderInstances?.filter(
        (id) => id !== providerInstanceId
      ),
    });
  };

  const { sync, loading: loadingProductsVariantsSync } = useProductsVariantsSync(
    activeChannelSlug,
    handleOnSyncCompleted
  );

  const handleSync = async (providerInstanceId: string) => {
    if (!activeChannel) {
      return;
    }

    const operation: ProductsVariantsSyncOperation =
      activeChannel.enabledProviderInstances.includes(providerInstanceId) ? "ADD" : "DELETE";

    return sync(providerInstanceId, operation);
  };

  const loading: ChannelsLoading = {
    channels: loadingChannels,
    productsVariantsSync: loadingProductsVariantsSync,
  };

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
          syncChannelProviderInstance={handleSync}
          loading={loading}
          errors={errors}
        />
      </div>
    </>
  );
};
