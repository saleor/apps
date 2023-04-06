import { useChannelsFetch } from "./useChannelsFetch";
import { MergedChannelSchema, SingleChannelSchema } from "../../../../lib/cms/config";
import { ChannelsErrors, ChannelsLoading } from "../types";
import { useChannelsQuery } from "../../../../../generated/graphql";
import { useIsMounted } from "usehooks-ts";
import { actions, useAppBridge } from "@saleor/app-sdk/app-bridge";

export const useChannels = () => {
  const { appBridge } = useAppBridge();
  const isMounted = useIsMounted();
  const [channelsQueryData, channelsQueryOpts] = useChannelsQuery({
    pause: !isMounted,
  });
  const {
    saveChannel: saveChannelFetch,
    isSaving,
    data: settings,
    error: fetchingError,
    isFetching,
  } = useChannelsFetch();

  const saveChannel = (channelToSave: SingleChannelSchema) => {
    console.log("saveChannel", channelToSave);

    saveChannelFetch(channelToSave).then(() => {
      appBridge?.dispatch(
        actions.Notification({
          title: "Success",
          status: "success",
          text: "Configuration saved",
        })
      );
    });
  };

  const loading: ChannelsLoading = {
    fetching: isFetching || channelsQueryData.fetching,
    saving: isSaving,
  };

  const errors: ChannelsErrors = {
    fetching: fetchingError ? Error(fetchingError) : null,
    saving: null,
  };

  const channels =
    channelsQueryData.data?.channels?.map(
      (channel) =>
        ({
          channelSlug: channel.slug,
          enabledProviderInstances: settings
            ? settings[`${channel.slug}`]?.enabledProviderInstances
            : [],
          channel: channel,
        } as MergedChannelSchema)
    ) || [];

  return { channels, saveChannel, loading, errors };
};
