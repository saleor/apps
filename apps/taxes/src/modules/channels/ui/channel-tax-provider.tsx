import { Grid, Typography } from "@material-ui/core";
import { Warning } from "@material-ui/icons";
import { Skeleton } from "@material-ui/lab";
import { Button, makeStyles } from "@saleor/macaw-ui";
import { PropsWithChildren } from "react";
import { useAppRedirect } from "../../../lib/app/redirect";
import { ProviderIcon } from "../../providers-configuration/ui/provider-icon";
import { providerConfig, TaxProviderName } from "../../taxes/provider-config";
import { useActiveTab, useChannelSlug, useInstanceId } from "../../taxes/tax-context";
import { trpcClient } from "../../trpc/trpc-client";
import { AppLink } from "../../ui/app-link";
import { AppPaper } from "../../ui/app-paper";
import { ChannelTaxProviderForm } from "./channel-tax-provider-form";

const useStyles = makeStyles((theme) => ({
  centerWithGap: {
    display: "flex",
    alignItems: "center",
    gap: theme.spacing(1),
  },
}));

const NoDataPlaceholder = ({
  title,
  children,
}: PropsWithChildren<{
  title: string;
}>) => {
  const styles = useStyles();

  return (
    <AppPaper>
      <div>
        <span className={styles.centerWithGap}>
          <Typography component={"h3"} variant="h3">
            {title}
          </Typography>
          <Warning />
        </span>
        <br />
        {children}
      </div>
    </AppPaper>
  );
};

const NoChannelPlaceholder = () => {
  const { redirect } = useAppRedirect();

  return (
    <NoDataPlaceholder title={"Channels not found"}>
      <Typography variant="body1">
        For a channel to appear on this list, you need to configure it on the{" "}
        <AppLink href="/taxes/channels">Tax Configuration</AppLink> page.
      </Typography>
      <br />
      <Typography variant="body1">
        By default, each channel will use <q>flat rates</q> as the tax calculation method. If you
        want a channel to calculate taxes using the Tax App, you need to change the tax calculation
        method to <b>Use tax app</b>.
      </Typography>
      <br />
      <Button onClick={() => redirect("/taxes/channels")}>Go to Tax Configuration</Button>
    </NoDataPlaceholder>
  );
};

const NoProviderPlaceholder = () => {
  const styles = useStyles();
  const { setActiveTab } = useActiveTab();
  const { setInstanceId } = useInstanceId();

  return (
    <NoDataPlaceholder title={"Tax providers not found"}>
      <Typography variant="body1">
        You need to set up at least one tax provider before you can configure a channel.
      </Typography>
      <br />
      <Typography>
        We currently support the following tax providers:
        <ul>
          {Object.entries(providerConfig).map(([provider, { label }]) => (
            <Typography variant="body1" component={"li"} key={label}>
              <span className={styles.centerWithGap}>
                {label}
                <ProviderIcon size={"medium"} provider={provider as TaxProviderName} />
              </span>
            </Typography>
          ))}
        </ul>
      </Typography>
      <Button
        onClick={() => {
          setActiveTab("providers");
          setInstanceId(null);
        }}
      >
        Configure a tax provider
      </Button>
    </NoDataPlaceholder>
  );
};

const ChannelTaxProviderSkeleton = () => {
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

export const ChannelTaxProvider = () => {
  const { channelSlug } = useChannelSlug();
  const channels = trpcClient.channels.fetch.useQuery(undefined, {});
  const providers = trpcClient.providersConfiguration.getAll.useQuery();

  if (channels?.isFetching || providers?.isFetching) {
    return <ChannelTaxProviderSkeleton />;
  }

  if (!channelSlug) {
    return <NoChannelPlaceholder />;
  }

  if (!providers?.data?.length) {
    return <NoProviderPlaceholder />;
  }

  return (
    <AppPaper>
      <ChannelTaxProviderForm />
    </AppPaper>
  );
};
