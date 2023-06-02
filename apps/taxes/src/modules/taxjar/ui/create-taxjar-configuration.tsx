import { useDashboardNotification } from "@saleor/apps-shared";
import { useRouter } from "next/router";
import { trpcClient } from "../../trpc/trpc-client";
import { TaxJarConfigurationForm } from "./taxjar-configuration-form";
import { TaxJarConfig } from "../taxjar-config";

export const CreateTaxJarConfiguration = () => {
  const router = useRouter();
  const { notifySuccess, notifyError } = useDashboardNotification();

  const { refetch: refetchProvidersConfigurationData } =
    trpcClient.providersConfiguration.getAll.useQuery();

  const { mutate: createMutation, isLoading: isCreateLoading } =
    trpcClient.taxJarConfiguration.post.useMutation({
      async onSuccess() {
        notifySuccess("Success", "Provider created");
        await refetchProvidersConfigurationData();
        router.push("/configuration");
      },
      onError(error) {
        notifyError("Error", error.message);
      },
    });

  const submitHandler = (data: TaxJarConfig) => {
    createMutation({ value: data });
  };

  return <TaxJarConfigurationForm isLoading={isCreateLoading} onSubmit={submitHandler} />;
};
