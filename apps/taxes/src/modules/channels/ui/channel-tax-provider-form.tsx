import { zodResolver } from "@hookform/resolvers/zod";
import {
  FormGroup,
  FormHelperText,
  Grid,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  TextFieldProps,
  Typography,
} from "@material-ui/core";
import { Save } from "@material-ui/icons";
import { Button, makeStyles } from "@saleor/macaw-ui";

import React from "react";
import { Controller, useForm } from "react-hook-form";
import {
  ChannelConfig,
  channelSchema,
  defaultChannelConfig,
} from "../../channels-configuration/channels-config";
import { ProvidersConfig } from "../../providers-configuration/providers-config";
import { ProviderIcon } from "../../providers-configuration/ui/provider-icon";
import { useChannelSlug } from "../../taxes/tax-context";
import { trpcClient } from "../../trpc/trpc-client";
import { useDashboardNotification } from "@saleor/apps-shared";

type ChannelTaxProviderFormValues = ChannelConfig;

const useStyles = makeStyles((theme) => ({
  reverseRow: {
    display: "flex",
    flexDirection: "row-reverse",
  },
  menuItem: {
    display: "flex",
    gap: theme.spacing(1),
    alignItems: "center",
  },
  helperText: {
    marginTop: 0,
    marginBottom: theme.spacing(1),
  },
}));

const getDefaultFormValues = (
  channel: ChannelConfig | undefined,
  providers: ProvidersConfig
): ChannelTaxProviderFormValues => {
  if (channel && channel.providerInstanceId !== "") {
    return {
      ...defaultChannelConfig,
      ...channel,
    };
  }

  const isOnlyOneInstance = providers.length === 1;

  if (isOnlyOneInstance) {
    return {
      ...defaultChannelConfig,
      providerInstanceId: providers[0].id,
    };
  }

  return defaultChannelConfig;
};

// todo: rename because address is here
export const ChannelTaxProviderForm = () => {
  const styles = useStyles();
  const { control, reset, handleSubmit } = useForm<ChannelTaxProviderFormValues>({
    resolver: zodResolver(channelSchema),
  });
  const { notifyError, notifySuccess } = useDashboardNotification();

  const { channelSlug } = useChannelSlug();

  const { data: channelConfigurationData, refetch: refetchChannelConfigurationData } =
    trpcClient.channelsConfiguration.fetch.useQuery(undefined, {
      onError(error) {
        notifyError("Error", error.message);
      },
    });

  const { data: providerInstances = [] } = trpcClient.providersConfiguration.getAll.useQuery(
    undefined,
    {
      onError(error) {
        notifyError("Error", error.message);
      },
    }
  );
  const channelConfig = channelConfigurationData?.[channelSlug];

  const { mutate, isLoading } = trpcClient.channelsConfiguration.upsert.useMutation({
    onSuccess() {
      refetchChannelConfigurationData();
      notifySuccess("Success", `Saved configuration of channel: ${channelSlug}`);
    },
    onError(error) {
      notifyError("Error", error.message);
    },
  });

  React.useEffect(() => {
    const defaultValues = getDefaultFormValues(channelConfig, providerInstances);

    reset(defaultValues);
  }, [channelConfig, providerInstances, reset]);

  const textFieldProps: TextFieldProps = {
    fullWidth: true,
  };

  const onSubmit = (values: ChannelTaxProviderFormValues) => {
    mutate({
      channelSlug,
      config: {
        ...values,
      },
    });
  };

  return (
    <div>
      <form onSubmit={handleSubmit(onSubmit)}>
        <Grid container spacing={4}>
          <Grid item xs={12}>
            <InputLabel>
              Channel tax provider
              <Controller
                name={"providerInstanceId"}
                control={control}
                defaultValue={""}
                render={({ field }) => (
                  <Select fullWidth {...field}>
                    {providerInstances.map(({ config, id, provider }) => (
                      <MenuItem value={id} key={id}>
                        <div className={styles.menuItem}>
                          <Typography variant="body1">{config.name}</Typography>
                          <ProviderIcon size={"medium"} provider={provider} />
                        </div>
                      </MenuItem>
                    ))}
                  </Select>
                )}
              />
            </InputLabel>
          </Grid>
          <Grid item xs={12}>
            <FormGroup>
              <Typography variant="h4">Ship from address</Typography>
              <FormHelperText className={styles.helperText}>
                The taxes will be calculated based on the address.
              </FormHelperText>

              <Grid container spacing={2}>
                <Grid item xs={8}>
                  {/* // todo: add country select */}
                  <Controller
                    name="address.country"
                    control={control}
                    defaultValue=""
                    render={({ field }) => (
                      <TextField {...field} label="Country" {...textFieldProps} />
                    )}
                  />
                </Grid>
                <Grid item xs={4}>
                  <Controller
                    name="address.zip"
                    control={control}
                    defaultValue=""
                    render={({ field }) => <TextField {...field} label="Zip" {...textFieldProps} />}
                  />
                </Grid>
                <Grid item xs={6}>
                  <Controller
                    name="address.state"
                    control={control}
                    defaultValue=""
                    render={({ field }) => (
                      <TextField {...field} label="State" {...textFieldProps} />
                    )}
                  />
                </Grid>
                <Grid item xs={6}>
                  <Controller
                    name="address.city"
                    control={control}
                    defaultValue=""
                    render={({ field }) => (
                      <TextField {...field} label="City" {...textFieldProps} />
                    )}
                  />
                </Grid>
                <Grid item xs={12}>
                  <Controller
                    name="address.street"
                    control={control}
                    defaultValue=""
                    render={({ field }) => (
                      <TextField {...field} label="Street" {...textFieldProps} />
                    )}
                  />
                </Grid>
              </Grid>
            </FormGroup>
          </Grid>
        </Grid>
        <br />
        <div className={styles.reverseRow}>
          <Button variant="primary" startIcon={<Save />} type="submit">
            {isLoading ? "Saving..." : "Save"}
          </Button>{" "}
        </div>
      </form>
    </div>
  );
};
