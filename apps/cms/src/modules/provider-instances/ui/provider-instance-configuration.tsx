import { FormControlLabel, Grid, Radio, RadioGroup, Typography } from "@material-ui/core";
import { makeStyles } from "@saleor/macaw-ui";
import Image from "next/image";
import React from "react";
import { CMSProviderSchema, providersConfig, SingleProviderSchema } from "../../../lib/cms/config";
import { AppPaper } from "../../ui/app-paper";
import ProviderInstanceConfigurationForm from "./provider-instance-configuration-form";
import { Skeleton } from "@material-ui/lab";
import { ProvidersErrors, ProvidersLoading } from "./types";
import { getProviderByName, Provider } from "../../providers/config";

const useStyles = makeStyles((theme) => ({
  radioLabel: {
    width: "100%",
    padding: theme.spacing(1),
    "&:hover": {
      backgroundColor:
        theme.palette.type === "dark" ? theme.palette.primary.dark : theme.palette.grey[50],
    },
  },
  gridItem: {
    display: "flex",
    justifyContent: "center",
  },
  radioLabelActive: {
    backgroundColor:
      theme.palette.type === "dark" ? theme.palette.primary.dark : theme.palette.grey[50],
  },
  iconWithLabel: {
    display: "flex",
    alignItems: "center",
    flexDirection: "column",
    gap: theme.spacing(1),
  },
  textCenter: {
    textAlign: "center",
  },
  textHeader: {
    textAlign: "center",
    margin: theme.spacing(1, 0, 3, 0),
  },
}));

const ProviderInstanceConfigurationSkeleton = () => {
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

interface ProviderInstanceConfigurationProps {
  activeProviderInstance?: SingleProviderSchema | null;
  newProviderInstance?: SingleProviderSchema | null;
  saveProviderInstance: (providerInstance: SingleProviderSchema) => any;
  deleteProviderInstance: (providerInstance: SingleProviderSchema) => any;
  loading: ProvidersLoading;
  errors: ProvidersErrors;
}

const ProviderInstanceConfiguration = ({
  activeProviderInstance,
  newProviderInstance,
  saveProviderInstance,
  deleteProviderInstance,
  loading,
  errors,
}: ProviderInstanceConfigurationProps) => {
  const [selectedProvider, setSelectedProvider] = React.useState<Provider | undefined>(
    getProviderByName(activeProviderInstance?.providerName)
  );
  const styles = useStyles();

  React.useEffect(() => {
    const provider = getProviderByName(activeProviderInstance?.providerName);

    setSelectedProvider(provider);
  }, [activeProviderInstance]);

  const handleProviderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const providerName = e.target.value as CMSProviderSchema;
    const provider = getProviderByName(providerName);

    setSelectedProvider(provider);
  };

  if (loading.fetching || loading.saving) {
    return <ProviderInstanceConfigurationSkeleton />;
  }

  if (!newProviderInstance && !activeProviderInstance) {
    return (
      <AppPaper>
        <Typography variant="body1" className={styles.textCenter}>
          Please select a provider instance or add new one.
        </Typography>
      </AppPaper>
    );
  }

  return (
    <AppPaper>
      {errors.fetching && (
        <Typography variant="body1" color="error">
          Error fetching available providers
        </Typography>
      )}
      {errors.saving && (
        <Typography variant="body1" color="error">
          Error saving provider instance configuration
        </Typography>
      )}
      {!!newProviderInstance && (
        <Typography variant="h3" className={styles.textHeader}>
          Add new instance
        </Typography>
      )}
      <RadioGroup value={selectedProvider?.name ?? ""} onChange={handleProviderChange}>
        <Grid container justifyContent="center">
          {Object.entries(providersConfig).map(([name, config]) => (
            <Grid className={styles.gridItem} item xs={4} key={name}>
              <FormControlLabel
                className={
                  selectedProvider?.name === name
                    ? `${styles.radioLabelActive} ${styles.radioLabel}`
                    : styles.radioLabel
                }
                control={<Radio style={{ display: "none" }} name="provider" value={name} />}
                label={
                  <div className={styles.iconWithLabel}>
                    <Image src={config.icon} alt={`${config.label} icon`} height={32} width={32} />
                    <Typography variant="body1">{config.label}</Typography>
                  </div>
                }
                labelPlacement="top"
                aria-label={config.label}
              />
            </Grid>
          ))}
        </Grid>
      </RadioGroup>
      {selectedProvider ? (
        <>
          <br />
          <ProviderInstanceConfigurationForm
            provider={selectedProvider}
            providerInstance={activeProviderInstance}
            loading={loading.saving}
            onSubmit={saveProviderInstance}
            onDelete={deleteProviderInstance}
          />
        </>
      ) : (
        <>
          <br />
          <Typography variant="body1" className={styles.textCenter}>
            Please select a provider.
          </Typography>
        </>
      )}
    </AppPaper>
  );
};

export default ProviderInstanceConfiguration;
