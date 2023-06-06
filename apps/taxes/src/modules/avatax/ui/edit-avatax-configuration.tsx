import { useDashboardNotification } from "@saleor/apps-shared";
import { Box, Button, Text } from "@saleor/macaw-ui/next";
import { useRouter } from "next/router";
import { z } from "zod";
import { trpcClient } from "../../trpc/trpc-client";
import { AvataxConfig, defaultAvataxConfig } from "../avatax-config";
import { AvataxConfigurationForm } from "./avatax-configuration-form";
import React from "react";

export const EditAvataxConfiguration = () => {
  const router = useRouter();
  const { id } = router.query;

  const configurationId = z.string().parse(id ?? "");

  const { refetch: refetchProvidersConfigurationData } =
    trpcClient.providersConfiguration.getAll.useQuery();

  const { notifySuccess, notifyError } = useDashboardNotification();
  const { mutate: patchMutation, isLoading: isPatchLoading } =
    trpcClient.avataxConfiguration.patch.useMutation({
      onSuccess() {
        notifySuccess("Success", "Updated Avatax configuration");
        refetchProvidersConfigurationData();
      },
      onError(error) {
        notifyError("Error", error.message);
      },
    });

  const { mutate: deleteMutation, isLoading: isDeleteLoading } =
    trpcClient.avataxConfiguration.delete.useMutation({
      onSuccess() {
        notifySuccess("Success", "Deleted Avatax configuration");
        refetchProvidersConfigurationData();
        router.push("/configuration");
      },
      onError(error) {
        notifyError("Error", error.message);
      },
    });

  const {
    data,
    isLoading: isGetLoading,
    isError: isGetError,
  } = trpcClient.avataxConfiguration.get.useQuery(
    {
      id: configurationId,
    },
    {
      enabled: !!configurationId,
    }
  );

  const submitHandler = React.useCallback(
    (data: AvataxConfig) => {
      patchMutation({ value: data, id: configurationId });
    },
    [configurationId, patchMutation]
  );

  const deleteHandler = () => {
    /*
     * // todo: add support for window.confirm to AppBridge or wait on Dialog component in Macaw
     * if (window.confirm("Are you sure you want to delete the provider?")) {
     */
    deleteMutation({ id: configurationId });
    // }
  };

  if (isGetLoading) {
    // todo: replace with skeleton once its available in Macaw
    return (
      <Box>
        <Text color="textNeutralSubdued">Loading...</Text>
      </Box>
    );
  }

  if (isGetError) {
    return (
      <Box>
        <Text color="textCriticalDefault">Error while fetching the provider data.</Text>
      </Box>
    );
  }
  return (
    <AvataxConfigurationForm
      isLoading={isPatchLoading}
      onSubmit={submitHandler}
      defaultValues={data.config}
      cancelButton={
        <Button onClick={deleteHandler} variant="error">
          Delete provider
        </Button>
      }
    />
  );
};
