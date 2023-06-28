import { useDashboardNotification } from "@saleor/apps-shared";
import { Button } from "@saleor/macaw-ui/next";
import { useRouter } from "next/router";
import { trpcClient } from "../../trpc/trpc-client";
import { TaxJarConfig, defaultTaxJarConfig } from "../taxjar-connection-schema";
import { TaxJarConfigurationForm } from "./taxjar-configuration-form";
import React from "react";

export const CreateTaxJarConfiguration = () => {
  const router = useRouter();
  const { notifySuccess, notifyError } = useDashboardNotification();

  const { refetch: refetchProvidersConfigurationData } =
    trpcClient.providersConfiguration.getAll.useQuery();

  const { mutate: createMutation, isLoading: isCreateLoading } =
    trpcClient.taxJarConnection.create.useMutation({
      async onSuccess() {
        notifySuccess("Success", "Provider created");
        await refetchProvidersConfigurationData();
        router.push("/configuration");
      },
      onError(error) {
        notifyError("Error", error.message);
      },
    });

  const submitHandler = React.useCallback(
    (data: TaxJarConfig) => {
      createMutation({ value: data });
    },
    [createMutation]
  );

  return (
    <TaxJarConfigurationForm
      isLoading={isCreateLoading}
      onSubmit={submitHandler}
      defaultValues={defaultTaxJarConfig}
      leftButton={
        <Button
          onClick={() => router.push("/configuration")}
          variant="tertiary"
          data-testid="create-taxjar-cancel-button"
        >
          Cancel
        </Button>
      }
    />
  );
};
