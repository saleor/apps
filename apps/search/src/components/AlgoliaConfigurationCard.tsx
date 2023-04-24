import { useAuthenticatedFetch } from "@saleor/app-sdk/app-bridge";

import { Controller, useForm } from "react-hook-form";
import { useMutation, useQuery, useQueryClient } from "react-query";
import { AlgoliaConfigurationFields } from "../lib/algolia/types";
import { fetchConfiguration } from "../lib/configuration";
import { Box, Button, Input } from "@saleor/macaw-ui/next";
import { useDashboardNotification } from "@saleor/apps-shared";

export const AlgoliaConfigurationCard = () => {
  const { notifyError, notifySuccess } = useDashboardNotification();
  const fetch = useAuthenticatedFetch();
  const { handleSubmit, setValue, control } = useForm<AlgoliaConfigurationFields>({
    defaultValues: { appId: "", indexNamePrefix: "", searchKey: "", secretKey: "" },
  });

  const reactQueryClient = useQueryClient();
  /**
   * TODO Extract to hook
   */
  const { isLoading: isQueryLoading } = useQuery({
    queryKey: ["configuration"],
    onSuccess(data) {
      setValue("secretKey", data?.secretKey || "");
      setValue("searchKey", data?.searchKey || "");
      setValue("appId", data?.appId || "");
      setValue("indexNamePrefix", data?.indexNamePrefix || "");
    },
    queryFn: async () => fetchConfiguration(fetch),
  });

  const { mutate, isLoading: isMutationLoading } = useMutation(
    async (conf: AlgoliaConfigurationFields) => {
      const resp = await fetch("/api/configuration", {
        method: "POST",
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
        notifySuccess("Configuration saved!");
      },
      onError: async (data: Error) => {
        notifyError("Could not save the configuration", data.message);
      },
    }
  );

  const onFormSubmit = handleSubmit(async (conf) => mutate(conf));

  const isFormDisabled = isMutationLoading || isQueryLoading;

  return (
    <div>
      <form onSubmit={onFormSubmit}>
        <Box marginBottom={4}>
          <Controller
            name="appId"
            control={control}
            render={({ field }) => {
              return (
                <Input
                  disabled={isFormDisabled}
                  label="Application ID"
                  helperText="Usually 10 characters, e.g. XYZAAABB00"
                  {...field}
                />
              );
            }}
          />
        </Box>
        <Controller
          name="searchKey"
          control={control}
          render={({ field }) => (
            <Input disabled={isFormDisabled} label="Search-Only API Key" {...field} />
          )}
        />
        <div key="secret">
          <Controller
            name="secretKey"
            control={control}
            render={({ field }) => (
              <Input
                helperText="In Algolia dashboard it's a masked field"
                disabled={isFormDisabled}
                label="Admin API Key"
                {...field}
              />
            )}
          />
        </div>

        <Controller
          name="indexNamePrefix"
          control={control}
          render={({ field }) => (
            <Input
              disabled={isFormDisabled}
              label="Index name prefix"
              helperText='Optional prefix, you can add "test" or "staging" to test the app'
              {...field}
            />
          )}
        />
        <Box marginTop={8} display={"flex"} justifyContent={"flex-end"}>
          <Button disabled={isFormDisabled} type="submit" variant="primary">
            {isFormDisabled ? "Loading..." : "Save"}
          </Button>
        </Box>
      </form>
    </div>
  );
};

/**
 * Export default for Next.dynamic
 */
