import { zodResolver } from "@hookform/resolvers/zod";
import { Checkbox, FormControl, FormControlLabel, Switch, Typography } from "@material-ui/core";
import {
  makeStyles,
  List,
  ListBody,
  ListHeader,
  ListItem,
  ListItemCell,
  ListFooter,
  Button,
} from "@saleor/macaw-ui";
import React from "react";
import { Controller, useController, useForm } from "react-hook-form";
import { z } from "zod";
import {
  channelSchema,
  ChannelSchema,
  MergedChannelSchema,
  SingleChannelSchema,
  SingleProviderSchema,
} from "../../../lib/cms/config";
import ProviderIcon from "../../provider-instances/ui/provider-icon";

const useStyles = makeStyles((theme) => {
  return {
    item: {
      height: "auto !important",
      display: "grid",
      gridTemplateColumns: "1fr 80px",
    },
    itemCell: {
      display: "flex",
      alignItems: "center",
      gap: theme.spacing(2),
    },
    footer: {
      display: "flex",
      justifyContent: "flex-end",
      padding: theme.spacing(2, 4),
    },
  };
});

interface ChannelConfigurationFormProps {
  channel?: MergedChannelSchema | null;
  providerInstances: SingleProviderSchema[];
  loading: boolean;
  onSubmit: (channel: SingleChannelSchema) => any;
}

const ChannelConfigurationForm = ({
  channel,
  providerInstances,
  loading,
  onSubmit,
}: ChannelConfigurationFormProps) => {
  const styles = useStyles();

  const {
    control,
    setValue,
    reset,
    resetField,
    handleSubmit,
    getValues,
    formState,
    register,
    watch,
  } = useForm<ChannelSchema>({
    resolver: zodResolver(channelSchema),
  });

  React.useEffect(() => {
    if (channel) {
      reset(channel);
    }

    resetField("channelSlug", {
      defaultValue: channel?.channelSlug,
    });
    resetField("enabledProviderInstances", {
      defaultValue: channel?.enabledProviderInstances || [],
    });
  }, [channel, providerInstances]);

  const errors = formState.errors;

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      {!!Object.entries(errors).length && (
        <Typography variant="body1" color="error">
          Error validating form
        </Typography>
      )}
      <input type="hidden" {...register("channelSlug")} value={channel?.channelSlug} />
      <List gridTemplate={["1fr", "checkbox"]}>
        <ListHeader>
          <ListItem className={styles.item}>
            <ListItemCell>CMS provider instance</ListItemCell>
            <ListItemCell>Active</ListItemCell>
          </ListItem>
        </ListHeader>
        <ListBody>
          {providerInstances.map((providerInstance) => (
            <ListItem key={providerInstance.name} className={styles.item}>
              <ListItemCell className={styles.itemCell}>
                <ProviderIcon providerName={providerInstance.providerName} />
                {providerInstance.name}
              </ListItemCell>
              <ListItemCell padding="checkbox">
                <FormControl
                  {...register("enabledProviderInstances")}
                  name="enabledProviderInstances"
                  checked={watch("enabledProviderInstances")?.some(
                    (formOption) => formOption === providerInstance.id
                  )}
                  onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                    const valueCopy = getValues("enabledProviderInstances")
                      ? [...getValues("enabledProviderInstances")]
                      : [];
                    if (event.target.checked) {
                      valueCopy.push(providerInstance.id);
                    } else {
                      const idx = valueCopy.findIndex(
                        (formOption) => formOption === providerInstance.id
                      );
                      valueCopy.splice(idx, 1);
                    }
                    console.log(valueCopy);
                    resetField("enabledProviderInstances", {
                      defaultValue: valueCopy,
                    });
                  }}
                  value={providerInstance.name}
                  component={(props) => <Checkbox {...props} />}
                />
              </ListItemCell>
            </ListItem>
          ))}
          {/* </>
            )}
          /> */}
        </ListBody>
        <ListFooter className={styles.footer}>
          <Button variant="primary" disabled={loading} type="submit">
            {loading ? "..." : "Save"}
          </Button>
        </ListFooter>
      </List>
    </form>
  );
};

export default ChannelConfigurationForm;
