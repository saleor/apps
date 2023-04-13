import { FormControlLabel, Grid, Radio, RadioGroup, Typography } from "@material-ui/core";
import { Button, makeStyles } from "@saleor/macaw-ui";
import Image from "next/image";
import React from "react";
import { CMSProviderSchema, providersConfig, SingleProviderSchema } from "../../../lib/cms/config";
import { AppPaper } from "../../ui/app-paper";
import { ProviderInstanceConfigurationForm } from "./provider-instance-configuration-form";
import { Skeleton } from "@material-ui/lab";
import { ProvidersErrors, ProvidersLoading } from "./types";
import { getProviderByName, Provider } from "../../providers/config";
import { ProviderInstancePingStatus } from "./hooks/usePingProviderInstance";
import { ProviderInstancePing } from "./provider-instance-ping";

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
  newProviderButton: {
    margin: "30px auto",
  },
  newProviderContainer: {
    display: "flex",
    justifyContent: "center",
  },
  box: {
    border: `1px solid hsla(212, 44%, 13%, 0.08)`,
    borderRadius: 8,
    padding: 20,
  },
  successStatus: {
    color: theme.palette.type === "dark" ? theme.palette.success.light : theme.palette.success.dark,
  },
  errorStatus: {
    color: theme.palette.error.main,
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
  providerInstancePingStatus: ProviderInstancePingStatus | null;
  onNewProviderRequest(): void;
}

export const ProviderInstanceConfiguration = ({
  activeProviderInstance,
  newProviderInstance,
  saveProviderInstance,
  deleteProviderInstance,
  loading,
  providerInstancePingStatus,
  onNewProviderRequest,
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

  const isPingStatusLoading =
    providerInstancePingStatus?.providerInstanceId !== activeProviderInstance?.id;

  if (loading.fetching || loading.saving) {
    return <ProviderInstanceConfigurationSkeleton />;
  }

  if (!newProviderInstance && !activeProviderInstance) {
    return (
      <AppPaper>
        <Typography variant="body1" className={styles.textCenter}>
          Please select a provider configuration or add new one.
        </Typography>
        <div className={styles.newProviderContainer}>
          <Button
            onClick={onNewProviderRequest}
            variant="primary"
            className={styles.newProviderButton}
          >
            Create a Provider config
          </Button>
        </div>
      </AppPaper>
    );
  }

  return (
    <AppPaper className={styles.box}>
      <div>
        {errors.fetching && (
          <Typography variant="body1" color="error">
            Error fetching available providers
          </Typography>
        )}
        {errors.saving && (
          <Typography variant="body1" color="error">
            Error saving provider configuration
          </Typography>
        )}
        {!!newProviderInstance && (
          <Typography variant="h3" className={styles.textHeader}>
            Add new configuration
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
                      <Image
                        src={config.icon}
                        alt={`${config.label} icon`}
                        height={32}
                        width={32}
                      />
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
            {!newProviderInstance && (
              <>
                <br />
                <ProviderInstancePing
                  loading={isPingStatusLoading}
                  status={providerInstancePingStatus}
                />
              </>
            )}
            <br />
            <ProviderInstanceConfigurationForm
              provider={selectedProvider}
              providerInstance={!newProviderInstance ? activeProviderInstance : null}
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
      </div>
    </AppPaper>
  );
};
