import { useAppBridge } from "@saleor/app-sdk/app-bridge";
import { Button, makeStyles } from "@saleor/macaw-ui";
import { Card, CardActions, CardHeader, TextField } from "@material-ui/core";
import { Controller, useForm } from "react-hook-form";
import { useQuery, useQueryClient, useMutation } from "react-query";
import { AlgoliaConfigurationFields } from "../lib/algolia/types";
import { fetchConfiguration } from "../lib/configuration";

const useStyles = makeStyles((theme) => ({
  form: {
    margin: theme.spacing(2),
  },
  confirmButton: {
    marginLeft: "auto",
  },
  fieldContainer: {
    marginBottom: theme.spacing(2),
  },
}));

export const AlgoliaConfigurationCard = () => {
  const { appBridge, appBridgeState } = useAppBridge();
  const { handleSubmit, setValue, control } = useForm<AlgoliaConfigurationFields>({
    defaultValues: { appId: "", indexNamePrefix: "", searchKey: "", secretKey: "" },
  });
  const classes = useStyles();
  const { token, saleorApiUrl } = appBridgeState || {};

  const reactQueryClient = useQueryClient();
  const { isLoading: isQueryLoading } = useQuery({
    queryKey: ["configuration"],
    onSuccess(data) {
      setValue("secretKey", data?.secretKey || "");
      setValue("searchKey", data?.searchKey || "");
      setValue("appId", data?.appId || "");
      setValue("indexNamePrefix", data?.indexNamePrefix || "");
    },
    queryFn: async () => fetchConfiguration(saleorApiUrl!, token!),
    enabled: !!token && !!saleorApiUrl,
  });

  const { mutate, isLoading: isMutationLoading } = useMutation(
    async (conf: AlgoliaConfigurationFields) => {
      const resp = await fetch("/api/configuration", {
        method: "POST",
        headers: {
          "saleor-api-url": saleorApiUrl!,
          "authorization-bearer": token!,
        },
        body: JSON.stringify(conf),
      });

      if (resp.status >= 200 && resp.status < 300) {
        const data = (await resp.json()) as { data?: AlgoliaConfigurationFields };

        return data.data;
      }
      throw new Error(`Server responded with status code ${resp.status}`);
    },
    {
      onSuccess: async () => {
        reactQueryClient.refetchQueries({
          queryKey: ["configuration"],
        });
        appBridge?.dispatch({
          type: "notification",
          payload: {
            status: "success",
            title: "Configuration saved!",
            actionId: "message-from-app",
          },
        });
      },
      onError: async (data: Error) => {
        appBridge?.dispatch({
          type: "notification",
          payload: {
            status: "error",
            title: "Could not save the configuration",
            text: data.message,
            actionId: "message-from-app",
          },
        });
      },
    }
  );

  const onFormSubmit = handleSubmit(async (conf) => mutate(conf));

  const isFormDisabled = isMutationLoading || isQueryLoading || !token || !saleorApiUrl;

  return (
    <Card>
      <form onSubmit={onFormSubmit}>
        <CardHeader title="Configure Algolia settings"></CardHeader>

        <div className={classes.form}>
          <Controller
            name="appId"
            control={control}
            render={({ field }) => (
              <TextField
                className={classes.fieldContainer}
                disabled={isFormDisabled}
                label="Application ID"
                helperText="Usually 10 characters, e.g. XYZAAABB00"
                {...field}
                fullWidth
              />
            )}
          />
          <Controller
            name="searchKey"
            control={control}
            render={({ field }) => (
              <TextField
                className={classes.fieldContainer}
                disabled={isFormDisabled}
                label="Search-Only API Key"
                {...field}
                fullWidth
              />
            )}
          />
          <div key="secret" className={classes.fieldContainer}>
            <Controller
              name="secretKey"
              control={control}
              render={({ field }) => (
                <TextField
                  helperText="In Algolia dashboard it's a masked field"
                  disabled={isFormDisabled}
                  label="Admin API Key"
                  {...field}
                  fullWidth
                />
              )}
            />
          </div>

          <Controller
            name="indexNamePrefix"
            control={control}
            render={({ field }) => (
              <TextField
                className={classes.fieldContainer}
                disabled={isFormDisabled}
                label="Index name prefix"
                helperText='Optional prefix, you can add "test" or "staging" to test the app'
                {...field}
                fullWidth
              />
            )}
          />
          <CardActions style={{ padding: "30px 0 0 0" }}>
            <Button disabled={isFormDisabled} type="submit" variant="primary" fullWidth>
              {isFormDisabled ? "Loading..." : "Save"}
            </Button>
          </CardActions>
        </div>
      </form>
    </Card>
  );
};

/**
 * Export default for Next.dynamic
 */
