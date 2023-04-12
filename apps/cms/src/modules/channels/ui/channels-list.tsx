import { Skeleton } from "@material-ui/lab";
import { MergedChannelSchema } from "../../../lib/cms";
import { AppPaper } from "../../ui/app-paper";

import { ChannelsLoading } from "./types";
import { ChannelsSelect } from "./channels-select";
import { ChannelsDataErrors } from "./hooks/useChannels";

const ChannelsListSkeleton = () => {
  return (
    <AppPaper>
      <Skeleton variant="rect" width={"100%"} height={30} />
    </AppPaper>
  );
};

interface ChannelsListProps {
  channels: MergedChannelSchema[];
  activeChannel?: MergedChannelSchema | null;
  setActiveChannel: (channel: MergedChannelSchema | null) => void;
  loading: ChannelsLoading;
  errors: ChannelsDataErrors;
}

export const ChannelsList = ({
  channels,
  activeChannel,
  setActiveChannel,
  loading,
  errors,
}: ChannelsListProps) => {
  if (loading.channels.fetching) {
    return <ChannelsListSkeleton />;
  }

  if (errors.fetching) {
    return <div>Error loading channels</div>;
  }

  return (
    <ChannelsSelect
      channels={channels}
      activeChannel={activeChannel}
      setActiveChannel={setActiveChannel}
    />
  );
};
