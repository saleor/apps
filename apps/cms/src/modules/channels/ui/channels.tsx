import { useEffect, useState } from "react";
import { MergedChannelSchema, SingleChannelSchema } from "../../../lib/cms/config";
import useProviderInstances from "../../provider-instances/ui/hooks/useProviderInstances";
import { Instructions } from "../../ui/instructions";
import ChannelConfiguration from "./channel-configuration";
import ChannelsList from "./channels-list";
import useChannels from "./hooks/useChannels";
import useSaveChannels from "./hooks/useChannelsFetch";

const Channels = () => {
  const { channels, saveChannel, loading, errors } = useChannels();
  const { providerInstances } = useProviderInstances();

  const [activeChannelSlug, setActiveChannelSlug] = useState<string | null>(
    channels.length ? channels[0].channelSlug : null
  );

  const handleSetActiveChannel = (channel: MergedChannelSchema | null) => {
    setActiveChannelSlug(channel?.channelSlug || null);
  };

  const activeChannel = channels.find((channel) => channel.channelSlug === activeChannelSlug);

  return (
    <>
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
        loading={loading}
        errors={errors}
      />
      <Instructions />
    </>
  );
};
export default Channels;
