import { useDashboardNotification } from "@saleor/apps-shared";
import { Button } from "@saleor/macaw-ui/next";
import { useRouter } from "next/router";
import { trpcClient } from "../../trpc/trpc-client";
import { TaxJarConfig } from "../taxjar-config";
import { TaxJarConfigurationForm } from "./taxjar-configuration-form";

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

  return (
    <TaxJarConfigurationForm
      isLoading={isCreateLoading}
      onSubmit={submitHandler}
      cancelButton={
        <Button onClick={() => router.push("/configuration")} variant="tertiary">
          Cancel
        </Button>
      }
    />
  );
};
