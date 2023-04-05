import { AppPaper } from "../../ui/app-paper";
import { Grid, Paper, Typography } from "@material-ui/core";
import { Skeleton } from "@material-ui/lab";
import { ChannelConfigurationForm } from "./channel-configuration-form";
import {
  MergedChannelSchema,
  SingleChannelSchema,
  SingleProviderSchema,
} from "../../../lib/cms/config";
import { ChannelsLoading } from "./types";
import { makeStyles } from "@saleor/macaw-ui";
import { AppTabNavButton } from "../../ui/app-tab-nav-button";
import { ChannelsDataErrors } from "./hooks/useChannels";

const useStyles = makeStyles((theme) => ({
  textCenter: {
    textAlign: "center",
  },
}));

const ChannelConfigurationSkeleton = () => {
  return (
    <AppPaper>
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <Skeleton variant="rect" width={"35%"} height={10} />
        </Grid>
        <Grid item xs={12}>
          <Skeleton variant="rect" width={"100%"} height={30} />
        </Grid>
        <br />
        <Grid item xs={12}>
          <Skeleton variant="rect" width={"35%"} height={10} />
        </Grid>
        <Grid item xs={8}>
          <Skeleton variant="rect" width={"100%"} height={50} />
        </Grid>
        <Grid item xs={4}>
          <Skeleton variant="rect" width={"100%"} height={50} />
        </Grid>
        <Grid item xs={6}>
          <Skeleton variant="rect" width={"100%"} height={50} />
        </Grid>
        <Grid item xs={6}>
          <Skeleton variant="rect" width={"100%"} height={50} />
        </Grid>
        <Grid item xs={12}>
          <Skeleton variant="rect" width={"100%"} height={50} />
        </Grid>
      </Grid>
    </AppPaper>
  );
};

interface ChannelConfigurationProps {
  activeChannel?: MergedChannelSchema | null;
  providerInstances: SingleProviderSchema[];
  saveChannel: (channel: SingleChannelSchema) => any;
  syncChannelProviderInstance: (providerInstanceId: string) => any;
  loading: ChannelsLoading;
  errors: ChannelsDataErrors;
}

export const ChannelConfiguration = ({
  activeChannel,
  providerInstances,
  saveChannel,
  syncChannelProviderInstance,
  loading,
  errors,
}: ChannelConfigurationProps) => {
  const styles = useStyles();

  if (loading.channels.fetching || loading.channels.saving) {
    return <ChannelConfigurationSkeleton />;
  }

  if (!activeChannel) {
    return (
      <AppPaper>
        <Typography variant="body1" className={styles.textCenter}>
          Please select a channel.
        </Typography>
      </AppPaper>
    );
  }

  if (!providerInstances.length) {
    return (
      <AppPaper>
        <Typography variant="body1" className={styles.textCenter}>
          Please create at least one provider configuration before you manage its setup in channels.
          <br />
          <br />
          Go to the <AppTabNavButton to="providers">Providers</AppTabNavButton> tab.
        </Typography>
      </AppPaper>
    );
  }

  return (
    <Paper elevation={0}>
      {errors.fetching && (
        <Typography variant="body1" color="error">
          Error fetching available channels
        </Typography>
      )}
      {errors.saving && (
        <Typography variant="body1" color="error">
          Error saving channel configuration
        </Typography>
      )}
      <ChannelConfigurationForm
        channel={activeChannel}
        providerInstances={providerInstances}
        loading={loading}
        onSubmit={saveChannel}
        onSync={syncChannelProviderInstance}
      />
    </Paper>
  );
};
