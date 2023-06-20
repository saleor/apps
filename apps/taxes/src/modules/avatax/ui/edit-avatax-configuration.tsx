import { useDashboardNotification } from "@saleor/apps-shared";
import { Box, Button, Text } from "@saleor/macaw-ui/next";
import { useRouter } from "next/router";
import React from "react";
import { z } from "zod";
import { trpcClient } from "../../trpc/trpc-client";
import { AvataxConnectionObfuscator } from "../avatax-connection-obfuscator";
import { AvataxConfig } from "../avatax-connection-schema";
import { AvataxConfigurationForm } from "./avatax-configuration-form";

const avataxObfuscator = new AvataxConnectionObfuscator();

export const EditAvataxConfiguration = () => {
  const router = useRouter();
  const { id } = router.query;

  const configurationId = z.string().parse(id ?? "");

  const { refetch: refetchProvidersConfigurationData } =
    trpcClient.providersConfiguration.getAll.useQuery();

  const { notifySuccess, notifyError } = useDashboardNotification();
  const { mutate: patchMutation, isLoading: isPatchLoading } =
    trpcClient.avataxConnection.update.useMutation({
      onSuccess() {
        notifySuccess("Success", "Updated Avatax configuration");
        refetchProvidersConfigurationData();
      },
      onError(error) {
        notifyError("Error", error.message);
      },
    });

  const { mutate: deleteMutation, isLoading: isDeleteLoading } =
    trpcClient.avataxConnection.delete.useMutation({
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
  } = trpcClient.avataxConnection.getById.useQuery(
    {
      id: configurationId,
    },
    {
      enabled: !!configurationId,
    }
  );

  const submitHandler = React.useCallback(
    (data: AvataxConfig) => {
      patchMutation({
        value: avataxObfuscator.filterOutObfuscated(data),
        id: configurationId,
      });
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
