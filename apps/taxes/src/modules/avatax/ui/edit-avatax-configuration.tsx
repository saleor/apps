import React from "react";
import { AvataxConfigurationForm } from "./avatax-configuration-form";
import { AvataxConfig } from "../avatax-config";
import { trpcClient } from "../../trpc/trpc-client";
import { useDashboardNotification } from "@saleor/apps-shared";
import { useRouter } from "next/router";
import { z } from "zod";

export const EditAvataxConfiguration = () => {
  const router = useRouter();
  const { id } = router.query;
  const configurationId = z.string().parse(id);

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

  const { data } = trpcClient.avataxConfiguration.get.useQuery({ id: configurationId });

  const submitHandler = (data: AvataxConfig) => {
    patchMutation({ value: data, id: configurationId });
  };

  return (
    <AvataxConfigurationForm
      isLoading={isPatchLoading}
      onSubmit={submitHandler}
      defaultValues={data?.config}
    />
  );
};
