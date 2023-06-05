import React from "react";
import { AvataxConfigurationForm } from "./avatax-configuration-form";
import { AvataxConfig, defaultAvataxConfig } from "../avatax-config";
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
    trpcClient.avataxConfiguration.post.useMutation({
      async onSuccess() {
        notifySuccess("Success", "Provider created");
        await refetchProvidersConfigurationData();
        router.push("/configuration");
      },
      onError(error) {
        notifyError("Error", error.message);
      },
    });

  const submitHandler = (data: AvataxConfig) => {
    createMutation({ value: data });
  };

  return (
    <AvataxConfigurationForm
      isLoading={isCreateLoading}
      onSubmit={submitHandler}
      defaultValues={defaultAvataxConfig}
      cancelButton={
        <Button onClick={() => router.push("/configuration")} variant="tertiary">
          Cancel
        </Button>
      }
    />
  );
};
