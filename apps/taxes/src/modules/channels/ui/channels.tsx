import { Grid } from "@material-ui/core";
import { Skeleton } from "@material-ui/lab";
import { useChannelSlug } from "../../taxes/tax-context";
import { trpcClient } from "../../trpc/trpc-client";
import { AppPaper } from "../../ui/app-paper";
import { ChannelsList } from "./channels-list";

const ChannelsSkeleton = () => {
  return (
    <AppPaper>
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <Skeleton variant="rect" width={"45%"} height={10} />
        </Grid>
        <Grid item xs={12}>
          <Skeleton variant="rect" width={"100%"} height={30} />
        </Grid>
      </Grid>
    </AppPaper>
  );
};

export const Channels = () => {
  const { channelSlug, setChannelSlug } = useChannelSlug();

  const channels = trpcClient.channels.fetch.useQuery(undefined, {
    onSuccess: (result) => {
      if (result?.[0]) {
        setChannelSlug(result?.[0].slug);
      }
    },
  });

  if (channels?.isFetching) {
    return <ChannelsSkeleton />;
  }

  if (channels.error) {
    return <div>Error. No channel available</div>;
  }

  if (channels.data?.length === 0) {
    // empty space for grid
    return <div></div>;
  }

  return (
    <AppPaper>
      <ChannelsList
        channels={channels.data ?? []}
        activeChannelSlug={channelSlug}
        onChannelClick={(nextSlug) => setChannelSlug(nextSlug)}
      />
    </AppPaper>
  );
};
