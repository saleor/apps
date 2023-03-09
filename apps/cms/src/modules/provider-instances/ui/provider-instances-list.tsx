import { Grid } from "@material-ui/core";
import { Add } from "@material-ui/icons";
import { Skeleton } from "@material-ui/lab";
import { Button, makeStyles } from "@saleor/macaw-ui";
import { SingleProviderSchema } from "../../../lib/cms/config";
import { AppPaper } from "../../ui/app-paper";
import ProviderInstancesListItems, { ProviderItem } from "./provider-instances-list-items";
import { ProvidersErrors, ProvidersLoading } from "./types";

const useStyles = makeStyles((theme) => {
  return {
    button: {
      padding: theme.spacing(1, 2),
      justifyContent: "flex-start",
    },
  };
});

const ProviderInstancesListSkeleton = () => {
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

interface ProviderInstancesListProps {
  providerInstances: SingleProviderSchema[];
  activeProviderInstance?: SingleProviderSchema | null;
  newProviderInstance?: SingleProviderSchema | null;
  setActiveProviderInstance: (providerInstance: SingleProviderSchema | null) => void;
  requestAddProviderInstance: () => void;
  loading: ProvidersLoading;
  errors: ProvidersErrors;
}

const ProviderInstancesList = ({
  providerInstances,
  activeProviderInstance,
  newProviderInstance,
  setActiveProviderInstance,
  requestAddProviderInstance,
  loading,
  errors,
}: ProviderInstancesListProps) => {
  const styles = useStyles();

  const handleSetActiveProviderInstance = (providerInstance: SingleProviderSchema) => {
    setActiveProviderInstance(providerInstance);
  };

  if (loading.fetching) {
    return <ProviderInstancesListSkeleton />;
  }

  if (errors.fetching) {
    return <div>Error loading providers</div>;
  }

  return (
    <Grid container spacing={1}>
      {!!providerInstances.length && (
        <Grid item xs={12}>
          <ProviderInstancesListItems
            providerInstances={providerInstances}
            activeProviderInstance={activeProviderInstance}
            setActiveProviderInstance={handleSetActiveProviderInstance}
          />
        </Grid>
      )}
      <Grid item xs={12}>
        <Button
          startIcon={<Add />}
          className={styles.button}
          fullWidth
          onClick={requestAddProviderInstance}
        >
          Add provider
        </Button>
      </Grid>
    </Grid>
  );
};

export default ProviderInstancesList;
