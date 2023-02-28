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
import { trpcClient } from "../../../../trpc/trpc-client";
import { AppLink } from "../../../../ui/app-link";
import { useInstanceId } from "../../../tax-context";
import { avataxInstanceConfigSchema } from "../avatax-config";

const useStyles = makeStyles((theme) => ({
  reverseRow: {
    display: "flex",
    flexDirection: "row-reverse",
    gap: theme.spacing(1),
  },
}));

const schema = avataxInstanceConfigSchema.omit({ provider: true });
type FormValues = z.infer<typeof schema>;

const defaultValues: FormValues = {
  config: {
    companyName: "",
    isAutocommit: false,
    isSandbox: false,
    password: "",
    username: "",
  },
  name: "",
};

export const AvataxConfigurationForm = () => {
  const [isWarningDialogOpen, setIsWarningDialogOpen] = React.useState(false);
  const styles = useStyles();
  const { appBridge } = useAppBridge();
  const { handleSubmit, reset, control, formState } = useForm<FormValues>({
    resolver: zodResolver(schema),
  });
  const [instanceId, setInstanceId] = useInstanceId();
  const { refetch: refetchChannelConfigurationData } =
    trpcClient.channelsConfiguration.fetch.useQuery();
  const { data: providersConfigurationData, refetch: refetchProvidersConfigurationData } =
    trpcClient.providersConfiguration.getAll.useQuery();

  const instance = providersConfigurationData?.find((instance) => instance.id === instanceId);

  const resetInstanceId = () => {
    setInstanceId(null);
  };

  React.useEffect(() => {
    if (instance) {
      const { provider, id, ...values } = instance;
      reset(values);
    } else {
      reset(defaultValues);
    }
  }, [instance, reset]);

  const { mutate: createMutation, isLoading: isCreateLoading } =
    trpcClient.providersConfiguration.create.useMutation({
      onSuccess({ id }) {
        setInstanceId(id);
        refetchProvidersConfigurationData();
        appBridge?.dispatch(
          actions.Notification({
            title: "Success",
            text: "Saved app configuration",
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
    trpcClient.providersConfiguration.update.useMutation({
      onSuccess() {
        refetchProvidersConfigurationData();
        appBridge?.dispatch(
          actions.Notification({
            title: "Success",
            text: "Updated Avalara configuration",
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

  const { mutate: deleteMutation } = trpcClient.providersConfiguration.delete.useMutation({
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

  const textFieldProps: TextFieldProps = {
    fullWidth: true,
  };

  const onSubmit = (values: FormValues) => {
    if (instanceId) {
      updateMutation({
        id: instanceId,
        provider: {
          ...values,
          provider: "avatax",
        },
      });
    } else {
      createMutation({
        provider: {
          ...values,
          provider: "avatax",
        },
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
      <form autoComplete="off" onSubmit={handleSubmit(onSubmit)}>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <Controller
              name="name"
              control={control}
              defaultValue=""
              render={({ field }) => (
                <TextField type="text" {...field} label="Instance name" {...textFieldProps} />
              )}
            />
            {formState.errors.name && (
              <FormHelperText error>{formState.errors.name.message}</FormHelperText>
            )}
          </Grid>
          <Grid item xs={12}>
            <InputLabel>
              Sandbox
              <Controller
                name={"config.isSandbox"}
                control={control}
                defaultValue={false}
                render={({ field }) => (
                  <Switch
                    {...field}
                    checked={field.value}
                    onChange={(e) => field.onChange(e.target.checked)}
                  />
                )}
              />
            </InputLabel>
            <FormHelperText>
              Toggling between{" "}
              <AppLink
                href={
                  "https://developer.avalara.com/erp-integration-guide/sales-tax-badge/authentication-in-avatax/sandbox-vs-production/"
                }
              >
                <q>Production</q> and <q>Sandbox</q>
              </AppLink>{" "}
              environments.{" "}
            </FormHelperText>
          </Grid>
          <Grid item xs={12}>
            <InputLabel>
              Autocommit
              <Controller
                name={"config.isAutocommit"}
                control={control}
                defaultValue={false}
                render={({ field }) => (
                  <Switch
                    {...field}
                    checked={field.value}
                    onChange={(e) => field.onChange(e.target.checked)}
                  />
                )}
              />
            </InputLabel>
            <FormHelperText>
              If enabled, the order will be automatically{" "}
              <AppLink
                href={
                  "https://developer.avalara.com/communications/dev-guide_rest_v2/commit-uncommit/"
                }
              >
                committed to Avalara.
              </AppLink>{" "}
            </FormHelperText>
          </Grid>
          <Grid item xs={12}>
            <Controller
              name="config.username"
              control={control}
              defaultValue=""
              render={({ field }) => (
                <TextField type="text" {...field} label="Username" {...textFieldProps} />
              )}
            />
            {formState.errors.config?.username && (
              <FormHelperText error>{formState.errors.config.username.message}</FormHelperText>
            )}
          </Grid>
          <Grid item xs={12}>
            <Controller
              name="config.password"
              control={control}
              defaultValue=""
              render={({ field }) => <TextField label="Password" {...field} {...textFieldProps} />}
            />
            {formState.errors.config?.password && (
              <FormHelperText error>{formState.errors.config.password.message}</FormHelperText>
            )}
          </Grid>
          <Grid item xs={12}>
            <Controller
              name="config.companyName"
              control={control}
              defaultValue=""
              render={({ field }) => (
                <TextField type="text" {...field} label="Company name" {...textFieldProps} />
              )}
            />
            {formState.errors.config?.companyName && (
              <FormHelperText error>{formState.errors.config.companyName.message}</FormHelperText>
            )}
          </Grid>
        </Grid>
        <br />
        <div className={styles.reverseRow}>
          <Button startIcon={<Save />} type="submit" variant="primary">
            {isLoading ? "Saving..." : "Save"}
          </Button>
          {instanceId && (
            <Button onClick={deleteProvider} startIcon={<Delete />}>
              Delete
            </Button>
          )}
        </div>
      </form>
      {/* <DeleteProviderDialog
        isOpen={isWarningDialogOpen}
        onClose={closeWarningDialog}
        onCancel={closeWarningDialog}
        onConfirm={deleteProvider}
      /> */}
    </>
  );
};
