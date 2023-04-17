import { FormControlLabel, Grid, Radio, RadioGroup, Typography } from "@material-ui/core";
import { makeStyles } from "@saleor/macaw-ui";
import React from "react";
import { AvataxConfiguration } from "../../avatax/ui/avatax-configuration";
import { providerConfig, TaxProviderName } from "../../taxes/provider-config";
import { TaxJarConfiguration } from "../../taxjar/ui/taxjar-configuration";
import { useInstanceId } from "../../taxes/tax-context";
import { trpcClient } from "../../trpc/trpc-client";
import { AppPaper } from "../../ui/app-paper";
import { ProviderIcon } from "./provider-icon";

const providersConfigurationComponent: Record<TaxProviderName, React.ComponentType> = {
  taxjar: TaxJarConfiguration,
  avatax: AvataxConfiguration,
};

const useStyles = makeStyles((theme) => ({
  radioLabel: {
    width: "100%",
    padding: theme.spacing(1),
    border: `1px solid ${theme.palette.divider}`,
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
}));

export const Configuration = () => {
  const [provider, setProvider] = React.useState<TaxProviderName>("taxjar");
  const { instanceId } = useInstanceId();
  const { data: providersConfigurationData } = trpcClient.providersConfiguration.getAll.useQuery();
  const styles = useStyles();

  React.useEffect(() => {
    const instance = providersConfigurationData?.find((instance) => instance.id === instanceId);

    setProvider(instance?.provider ?? "taxjar");
  }, [instanceId, providersConfigurationData]);

  const SelectedConfigurationForm = React.useMemo(
    () => (provider ? providersConfigurationComponent[provider] : () => null),
    [provider]
  );

  return (
    <AppPaper>
      {!instanceId && (
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <div className={styles.gridItem}>
              <Typography component="h3" variant="h3">
                Please select one of the providers:
              </Typography>
            </div>
          </Grid>
          <Grid item xs={12}>
            <RadioGroup
              value={provider ?? ""}
              onChange={(e) => setProvider(e.target.value as TaxProviderName)}
            >
              <Grid container justifyContent="center">
                {Object.entries(providerConfig).map(([name, config]) => (
                  <Grid className={styles.gridItem} item xs={6} key={name}>
                    <FormControlLabel
                      className={
                        provider === name
                          ? `${styles.radioLabelActive} ${styles.radioLabel}`
                          : styles.radioLabel
                      }
                      control={<Radio style={{ display: "none" }} name="provider" value={name} />}
                      label={
                        <div className={styles.iconWithLabel}>
                          <ProviderIcon size={"xlarge"} provider={name as TaxProviderName} />
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
          </Grid>
        </Grid>
      )}
      <SelectedConfigurationForm />
    </AppPaper>
  );
};
