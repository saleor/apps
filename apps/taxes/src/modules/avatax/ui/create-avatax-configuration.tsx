import React from "react";
import { AvataxConfigurationForm } from "./avatax-configuration-form";
import { AvataxConfig, defaultAvataxConfig } from "../avatax-connection-schema";
import { trpcClient } from "../../trpc/trpc-client";
import { useDashboardNotification } from "@saleor/apps-shared";
import { useRouter } from "next/router";
import { Button } from "@saleor/macaw-ui/next";

export const CreateAvataxConfiguration = () => {
  const router = useRouter();
  const { notifySuccess, notifyError } = useDashboardNotification();

  const { refetch: refetchProvidersConfigurationData } =
    trpcClient.providersConfiguration.getAll.useQuery();

  const { mutate: createMutation, isLoading: isCreateLoading } =
    trpcClient.avataxConnection.create.useMutation({
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
    (data: AvataxConfig) => {
      createMutation({ value: data });
    },
    [createMutation]
  );

  return (
    <AvataxConfigurationForm
      isLoading={isCreateLoading}
      onSubmit={submitHandler}
      defaultValues={defaultAvataxConfig}
      leftButton={
        <Button
          onClick={() => router.push("/configuration")}
          variant="tertiary"
          data-testid="create-avatax-cancel-button"
        >
          Cancel
        </Button>
      }
    />
  );
};
