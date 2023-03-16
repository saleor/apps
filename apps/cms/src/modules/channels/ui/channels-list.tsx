import { Grid } from "@material-ui/core";
import { Skeleton } from "@material-ui/lab";
import { ChannelFragment } from "../../../../generated/graphql";
import { MergedChannelSchema, SingleChannelSchema } from "../../../lib/cms";
import { AppPaper } from "../../ui/app-paper";
import ChannelsListItems from "./channels-list-items";
import { ChannelsErrors, ChannelsLoading } from "./types";

const ChannelsListSkeleton = () => {
  return (
    <AppPaper>
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <Skeleton variant="rect" width={"45%"} height={10} />
        </Grid>
        <Grid item xs={12}>
          <Skeleton variant="rect" width={"100%"} height={30} />
        </Grid>
        <Grid item xs={12}>
          <Skeleton variant="rect" width={"100%"} height={30} />
        </Grid>
      </Grid>
    </AppPaper>
  );
};

interface ChannelsListProps {
  channels: MergedChannelSchema[];
  activeChannel?: MergedChannelSchema | null;
  setActiveChannel: (channel: MergedChannelSchema | null) => void;
  loading: ChannelsLoading;
  errors: ChannelsErrors;
}

const ChannelsList = ({
  channels,
  activeChannel,
  setActiveChannel,
  loading,
  errors,
}: ChannelsListProps) => {
  if (loading.fetching) {
    return <ChannelsListSkeleton />;
  }

  if (errors.fetching) {
    return <div>Error loading channels</div>;
  }

  return (
    <ChannelsListItems
      channels={channels}
      activeChannel={activeChannel}
      setActiveChannel={setActiveChannel}
    />
  );
};

export default ChannelsList;
