import { zodResolver } from "@hookform/resolvers/zod";
import {
  FormHelperText,
  Grid,
  InputLabel,
  Switch,
  TextField,
  TextFieldProps,
} from "@material-ui/core";
import { Delete, Save } from "@material-ui/icons";
import { actions, useAppBridge } from "@saleor/app-sdk/app-bridge";
import { Button, makeStyles } from "@saleor/macaw-ui";
import React from "react";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";
import { trpcClient } from "../../trpc/trpc-client";
import { useInstanceId } from "../../taxes/tax-context";
import { taxJarConfigSchema, taxJarInstanceConfigSchema } from "../taxjar-config";

const useStyles = makeStyles((theme) => ({
  reverseRow: {
    display: "flex",
    flexDirection: "row-reverse",
    gap: theme.spacing(1),
  },
}));

const schema = taxJarConfigSchema;
type FormValues = z.infer<typeof schema>;

const defaultValues: FormValues = {
  name: "",
  apiKey: "",
  isSandbox: false,
};

export const TaxJarConfigurationForm = () => {
  const [isWarningDialogOpen, setIsWarningDialogOpen] = React.useState(false);
  const styles = useStyles();
  const { instanceId, setInstanceId } = useInstanceId();
  const { appBridge } = useAppBridge();
  const { handleSubmit, reset, control, formState } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues,
  });

  const resetInstanceId = () => {
    setInstanceId(null);
  };

  const { refetch: refetchChannelConfigurationData } =
    trpcClient.channelsConfiguration.fetch.useQuery(undefined, {
      onError(error) {
        appBridge?.dispatch(
          actions.Notification({
            title: "Error",
            text: error.message,
            status: "error",
          })
        );
      },
    });

  const { data: providersConfigurationData, refetch: refetchProvidersConfigurationData } =
    trpcClient.providersConfiguration.getAll.useQuery(undefined, {
      onError(error) {
        appBridge?.dispatch(
          actions.Notification({
            title: "Error",
            text: error.message,
            status: "error",
          })
        );
      },
    });

  const instance = providersConfigurationData?.find((instance) => instance.id === instanceId);

  const { mutate: createMutation, isLoading: isCreateLoading } =
    trpcClient.taxJarConfiguration.post.useMutation({
      onSuccess({ data: { id } }) {
        setInstanceId(id);
        refetchProvidersConfigurationData();
        refetchChannelConfigurationData();
        appBridge?.dispatch(
          actions.Notification({
            title: "Success",
            text: "Saved TaxJar configuration",
            status: "success",
          })
        );
      },
      onError(error) {
        appBridge?.dispatch(
          actions.Notification({
            title: "Error",
            text: error.message,
            status: "error",
          })
        );
      },
    });

  const { mutate: updateMutation, isLoading: isUpdateLoading } =
    trpcClient.taxJarConfiguration.patch.useMutation({
      onSuccess() {
        refetchProvidersConfigurationData();
        refetchChannelConfigurationData();
        appBridge?.dispatch(
          actions.Notification({
            title: "Success",
            text: "Updated TaxJar configuration",
            status: "success",
          })
        );
      },
      onError(error) {
        appBridge?.dispatch(
          actions.Notification({
            title: "Error",
            text: error.message,
            status: "error",
          })
        );
      },
    });

  const { mutate: deleteMutation, isLoading: isDeleteLoading } =
    trpcClient.taxJarConfiguration.delete.useMutation({
      onSuccess() {
        resetInstanceId();
        refetchProvidersConfigurationData();
        refetchChannelConfigurationData();
        appBridge?.dispatch(
          actions.Notification({
            title: "Success",
            text: "Remove TaxJar instance",
            status: "success",
          })
        );
      },
      onError(error) {
        appBridge?.dispatch(
          actions.Notification({
            title: "Error",
            text: error.message,
            status: "error",
          })
        );
      },
    });

  React.useEffect(() => {
    if (instance) {
      const { config } = instance;
      reset(config);
    } else {
      reset({ ...defaultValues });
    }
  }, [instance, instanceId, reset]);

  const textFieldProps: TextFieldProps = {
    fullWidth: true,
  };

  const onSubmit = (value: FormValues) => {
    if (instanceId) {
      updateMutation({
        id: instanceId,
        value,
      });
    } else {
      createMutation({
        value,
      });
    }
  };

  const closeWarningDialog = () => {
    setIsWarningDialogOpen(false);
  };

  const openWarningDialog = () => {
    setIsWarningDialogOpen(true);
  };

  const deleteProvider = () => {
    closeWarningDialog();
    if (instanceId) {
      deleteMutation({ id: instanceId });
    }
  };

  const isLoading = isCreateLoading || isUpdateLoading;

  return (
    <>
      <form onSubmit={handleSubmit(onSubmit)}>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <Controller
              name="name"
              control={control}
              defaultValue={defaultValues.name}
              render={({ field }) => (
                <TextField type="text" {...field} label="Instance name" {...textFieldProps} />
              )}
            />
            {formState.errors.name && (
              <FormHelperText error>{formState.errors.name.message}</FormHelperText>
            )}
          </Grid>
          <Grid item xs={12}>
            <Controller
              name="apiKey"
              control={control}
              defaultValue={defaultValues.apiKey}
              render={({ field }) => <TextField label="API Key" {...field} {...textFieldProps} />}
            />
            {formState.errors?.apiKey && (
              <FormHelperText error>{formState.errors?.apiKey.message}</FormHelperText>
            )}
          </Grid>
          <Grid item xs={12}>
            <InputLabel>
              Sandbox
              <Controller
                name={"isSandbox"}
                control={control}
                defaultValue={defaultValues.isSandbox}
                render={({ field }) => (
                  <Switch
                    {...field}
                    checked={field.value}
                    onChange={(e) => field.onChange(e.target.checked)}
                  />
                )}
              />
            </InputLabel>
          </Grid>
        </Grid>
        <br />
        <div className={styles.reverseRow}>
          <Button startIcon={<Save />} type="submit" variant="primary">
            {isLoading ? "Saving..." : "Save"}
          </Button>
          {instanceId && (
            <Button onClick={deleteProvider} startIcon={<Delete />}>
              {isDeleteLoading ? "Deleting..." : "Delete"}
            </Button>
          )}
        </div>
      </form>
      {/* // todo: bring back to life once Dashboard allows to summon dialog */}
      {/* <DeleteProviderDialog
        isOpen={isWarningDialogOpen}
        onClose={closeWarningDialog}
        onCancel={closeWarningDialog}
        onConfirm={deleteProvider}
      /> */}
    </>
  );
};
