import { zodResolver } from "@hookform/resolvers/zod";
import { Checkbox, FormControl, Typography } from "@material-ui/core";
import {
  Button,
  List,
  ListBody,
  ListFooter,
  ListHeader,
  ListItem,
  ListItemCell,
  makeStyles,
  Notification,
  Alert,
  IconButton,
} from "@saleor/macaw-ui";
import React from "react";
import { useForm } from "react-hook-form";
import {
  channelSchema,
  ChannelSchema,
  MergedChannelSchema,
  SingleChannelSchema,
  SingleProviderSchema,
} from "../../../lib/cms/config";
import { ProviderIcon } from "../../provider-instances/ui/provider-icon";
import { ChannelsLoading } from "./types";

const useStyles = makeStyles((theme) => {
  return {
    item: {
      height: "auto !important",
      display: "grid",
      gridTemplateColumns: "1fr 80px 80px",
    },
    itemCell: {
      display: "flex",
      alignItems: "center",
      gap: theme.spacing(2),
    },
    itemCellCenter: {
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      gap: theme.spacing(2),
    },
    itemCellProgress: {
      padding: theme.spacing(0, 4),
      gridColumn: "1/5",
    },
    footer: {
      display: "flex",
      justifyContent: "flex-end",
      padding: theme.spacing(2, 4),
    },
    form: {
      border: `1px solid hsla(212, 44%, 13%, 0.08)`,
      borderRadius: 8,
    },
  };
});

interface ChannelConfigurationFormProps {
  channel?: MergedChannelSchema | null;
  providerInstances: SingleProviderSchema[];
  loading: ChannelsLoading;
  onSubmit: (channel: SingleChannelSchema) => any;
  onSync: (providerInstanceId: string) => any;
}

export const ChannelConfigurationForm = ({
  channel,
  providerInstances,
  loading,
  onSubmit,
  onSync,
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
    resetField("requireSyncProviderInstances", {
      defaultValue: channel?.requireSyncProviderInstances || [],
    });
  }, [channel, providerInstances]);

  const errors = formState.errors;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className={styles.form}>
      {!!Object.entries(errors).length && (
        <Typography variant="body1" color="error">
          Error validating form
        </Typography>
      )}
      <input type="hidden" {...register("channelSlug")} value={channel?.channelSlug} />

      <List gridTemplate={["1fr", "80px", "checkbox"]}>
        <ListHeader>
          <ListItem className={styles.item}>
            <ListItemCell>CMS provider configuration</ListItemCell>
            <ListItemCell className={styles.itemCellCenter}>Active</ListItemCell>
            <ListItemCell className={styles.itemCellCenter}>Sync</ListItemCell>
          </ListItem>
        </ListHeader>
        <ListBody>
          {providerInstances.map((providerInstance) => {
            const enabledProviderInstances = watch("enabledProviderInstances");
            const requireSyncProviderInstances = watch("requireSyncProviderInstances");
            const isEnabled = enabledProviderInstances?.some(
              (formOption) => formOption === providerInstance.id
            );
            const requireSync = requireSyncProviderInstances?.some(
              (formOption) => formOption === providerInstance.id
            );

            return (
              <ListItem key={providerInstance.id} className={styles.item}>
                <ListItemCell className={styles.itemCell}>
                  <ProviderIcon providerName={providerInstance.providerName} />
                  {providerInstance.name}
                </ListItemCell>
                <ListItemCell padding="checkbox" className={styles.itemCellCenter}>
                  <FormControl
                    {...register("enabledProviderInstances")}
                    name="enabledProviderInstances"
                    checked={isEnabled}
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
                      resetField("enabledProviderInstances", {
                        defaultValue: valueCopy,
                      });
                    }}
                    value={providerInstance.name}
                    component={(props) => <Checkbox {...props} />}
                  />
                </ListItemCell>
                <ListItemCell className={styles.itemCellCenter}>
                  <Button
                    variant="primary"
                    disabled={
                      !requireSync || !!loading.productsVariantsSync.syncingProviderInstanceId
                    }
                    onClick={() => onSync(providerInstance.id)}
                  >
                    Sync
                  </Button>
                </ListItemCell>
                {loading.productsVariantsSync.syncingProviderInstanceId === providerInstance.id && (
                  <ListItemCell className={styles.itemCellProgress}>
                    Syncing products...
                    <progress
                      value={loading.productsVariantsSync.currentProductIndex}
                      max={loading.productsVariantsSync.totalProductsCount}
                      style={{
                        height: "30px",
                        width: "500px",
                        maxWidth: "100%",
                      }}
                    />
                  </ListItemCell>
                )}
              </ListItem>
            );
          })}
          {/* </>
            )}
          /> */}
        </ListBody>
        <ListFooter className={styles.footer}>
          <Button variant="primary" disabled={loading.channels.saving} type="submit">
            {loading.channels.saving ? "..." : "Save"}
          </Button>
        </ListFooter>
      </List>
    </form>
  );
};
