import { useDashboardNotification } from "@saleor/apps-shared";
import { Box, Button, Text } from "@saleor/macaw-ui";
import { useRouter } from "next/router";
import React from "react";
import { z } from "zod";
import { Obfuscator } from "../../../lib/obfuscator";
import { trpcClient } from "../../trpc/trpc-client";
import { TaxJarConfig } from "../taxjar-connection-schema";
import { TaxJarConfigurationForm } from "./taxjar-configuration-form";
import { TaxJarConnectionObfuscator } from "../configuration/taxjar-connection-obfuscator";

const taxJarObfuscator = new TaxJarConnectionObfuscator();

export const EditTaxJarConfiguration = () => {
  const router = useRouter();
  const { id } = router.query;
  const configurationId = z.string().parse(id ?? "");

  const { refetch: refetchProvidersConfigurationData } =
    trpcClient.providersConfiguration.getAll.useQuery();

  const { notifySuccess, notifyError } = useDashboardNotification();
  const { mutate: patchMutation, isLoading: isPatchLoading } =
    trpcClient.taxJarConnection.update.useMutation({
      onSuccess() {
        notifySuccess("Success", "Updated TaxJar configuration");
        refetchProvidersConfigurationData();
      },
      onError(error) {
        notifyError("Error", error.message);
      },
    });

  const {
    data,
    isLoading: isGetLoading,
    isError: isGetError,
  } = trpcClient.taxJarConnection.getById.useQuery(
    { id: configurationId },
    {
      enabled: !!configurationId,
    },
  );

  const submitHandler = React.useCallback(
    (data: TaxJarConfig) => {
      patchMutation({
        value: taxJarObfuscator.filterOutObfuscated(data),
        id: configurationId,
      });
    },
    [configurationId, patchMutation],
  );

  const { mutate: deleteMutation, isLoading: isDeleteLoading } =
    trpcClient.taxJarConnection.delete.useMutation({
      onSuccess() {
        notifySuccess("Success", "Deleted TaxJar configuration");
        refetchProvidersConfigurationData();
        router.push("/configuration");
      },
      onError(error) {
        notifyError("Error", error.message);
      },
    });

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
    <TaxJarConfigurationForm
      isLoading={isPatchLoading}
      onSubmit={submitHandler}
      defaultValues={data.config}
      leftButton={
        <Button onClick={deleteHandler} variant="error" data-testid="delete-taxjar-button">
          Delete provider
        </Button>
      }
    />
  );
};
