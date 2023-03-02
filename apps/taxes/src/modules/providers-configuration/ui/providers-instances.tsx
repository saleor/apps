import { Grid } from "@material-ui/core";
import { Add } from "@material-ui/icons";
import { Skeleton } from "@material-ui/lab";
import { Button, makeStyles } from "@saleor/macaw-ui";
import { useInstanceId } from "../../taxes/tax-context";
import { trpcClient } from "../../trpc/trpc-client";
import { AppPaper } from "../../ui/app-paper";
import { TaxProvidersInstancesList } from "./providers-instances-list";

const useStyles = makeStyles((theme) => {
  return {
    button: {
      padding: theme.spacing(1, 2),
      justifyContent: "flex-start",
    },
  };
});

const ProvidersSkeleton = () => {
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

export const ProvidersInstances = () => {
  const styles = useStyles();
  const providers = trpcClient.providersConfiguration.getAll.useQuery();
  const { setInstanceId } = useInstanceId();

  if (providers?.isFetching) {
    return <ProvidersSkeleton />;
  }

  if (providers.error) {
    return <div>Error. No provider available</div>;
  }

  const isAnyProvider = providers.data?.length !== 0;

  if (!isAnyProvider) {
    return <div></div>;
  }

  return (
    <Grid container spacing={2}>
      <Grid item xs={12}>
        <TaxProvidersInstancesList />
      </Grid>
      <Grid item xs={12}>
        <Button
          variant="secondary"
          startIcon={<Add />}
          className={styles.button}
          fullWidth
          onClick={() => setInstanceId(null)}
        >
          Add provider
        </Button>
      </Grid>
    </Grid>
  );
};
