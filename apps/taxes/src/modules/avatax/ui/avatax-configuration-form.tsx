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
import { Button, makeStyles } from "@saleor/macaw-ui";
import React from "react";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";
import { useInstanceId } from "../../taxes/tax-context";
import { trpcClient } from "../../trpc/trpc-client";
import { AppLink } from "../../ui/app-link";
import { avataxConfigSchema } from "../avatax-config";
import { useDashboardNotification } from "@saleor/apps-shared";

const useStyles = makeStyles((theme) => ({
  reverseRow: {
    display: "flex",
    flexDirection: "row-reverse",
    gap: theme.spacing(1),
  },
}));

const schema = avataxConfigSchema;

type FormValues = z.infer<typeof schema>;

const defaultValues: FormValues = {
  companyCode: "",
  isAutocommit: false,
  isSandbox: false,
  password: "",
  username: "",
  name: "",
};

export const AvataxConfigurationForm = () => {
  const { notifySuccess, notifyError } = useDashboardNotification();
  const [isWarningDialogOpen, setIsWarningDialogOpen] = React.useState(false);
  const styles = useStyles();
  const { handleSubmit, reset, control, formState } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues,
  });
  const { instanceId, setInstanceId } = useInstanceId();
  const { refetch: refetchChannelConfigurationData } =
    trpcClient.channelsConfiguration.fetch.useQuery(undefined, {
      onError(error) {
        notifyError("Error", error.message);
      },
    });
  const { refetch: refetchProvidersConfigurationData } =
    trpcClient.providersConfiguration.getAll.useQuery();
  const { data: instance } = trpcClient.avataxConfiguration.get.useQuery(
    { id: instanceId ?? "" },
    {
      enabled: !!instanceId,
      onError(error) {
        notifyError("Error", error.message);
      },
    }
  );

  const resetInstanceId = () => {
    setInstanceId(null);
  };

  React.useEffect(() => {
    if (instance) {
      const { config } = instance;

      reset(config);
    } else {
      reset(defaultValues);
    }
  }, [instance, reset]);

  const { mutate: createMutation, isLoading: isCreateLoading } =
    trpcClient.avataxConfiguration.post.useMutation({
      onSuccess({ id }) {
        setInstanceId(id);
        refetchProvidersConfigurationData();
        notifySuccess("Success", "Saved app configuration");
      },
      onError(error) {
        notifyError("Error", error.message);
      },
    });

  const { mutate: updateMutation, isLoading: isUpdateLoading } =
    trpcClient.avataxConfiguration.patch.useMutation({
      onSuccess() {
        refetchProvidersConfigurationData();
        notifySuccess("Success", "Updated Avalara configuration");
      },
      onError(error) {
        notifyError("Error", error.message);
      },
    });

  const { mutate: deleteMutation } = trpcClient.avataxConfiguration.delete.useMutation({
    onSuccess() {
      resetInstanceId();
      refetchProvidersConfigurationData();
      refetchChannelConfigurationData();
      notifySuccess("Success", "Removed Avatax instance");
    },
    onError(error) {
      notifyError("Error", error.message);
    },
  });

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
      <form autoComplete="off" onSubmit={handleSubmit(onSubmit)}>
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
                name={"isAutocommit"}
                control={control}
                defaultValue={defaultValues.isAutocommit}
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
              name="username"
              control={control}
              defaultValue=""
              render={({ field }) => (
                <TextField type="text" {...field} label="Username" {...textFieldProps} />
              )}
            />
            {formState.errors.username && (
              <FormHelperText error>{formState.errors.username.message}</FormHelperText>
            )}
          </Grid>
          <Grid item xs={12}>
            <Controller
              name="password"
              control={control}
              defaultValue={defaultValues.password}
              render={({ field }) => <TextField label="Password" {...field} {...textFieldProps} />}
            />
            {formState.errors.password && (
              <FormHelperText error>{formState.errors.password.message}</FormHelperText>
            )}
          </Grid>
          <Grid item xs={12}>
            <Controller
              name="companyCode"
              control={control}
              defaultValue={defaultValues.companyCode}
              render={({ field }) => (
                <TextField type="text" {...field} label="Company code" {...textFieldProps} />
              )}
            />
            {formState.errors.companyCode && (
              <FormHelperText error>{formState.errors.companyCode.message}</FormHelperText>
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
