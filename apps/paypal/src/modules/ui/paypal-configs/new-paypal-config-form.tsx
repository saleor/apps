import { zodResolver } from "@hookform/resolvers/zod";
import { useDashboardNotification } from "@saleor/apps-shared/use-dashboard-notification";
import { Layout } from "@saleor/apps-ui";
import { Box, Button, Text } from "@saleor/macaw-ui";
import { Input, Select } from "@saleor/react-hook-form-macaw";
import { useRouter } from "next/router";
import { useForm } from "react-hook-form";

import { newPayPalConfigInputSchema } from "@/modules/app-config/trpc-handlers/new-paypal-config-input-schema";
import { trpcClient } from "@/modules/trpc/trpc-client";

type FormShape = {
  clientSecret: string;
  name: string;
  clientId: string;
  environment: "SANDBOX" | "LIVE";
};

const RequiredInputLabel = (props: { labelText: string }) => {
  return (
    <Box>
      <Text size={2} color="default2">
        {props.labelText}
      </Text>{" "}
      <Text size={2} color="critical2">
        *
      </Text>
    </Box>
  );
};

export const NewPayPalConfigForm = () => {
  const router = useRouter();
  const { notifyError, notifySuccess } = useDashboardNotification();

  const { mutate } = trpcClient.appConfig.saveNewPayPalConfig.useMutation({
    onSuccess() {
      notifySuccess("Configuration saved");

      return router.push("/config");
    },
    onError(err) {
      notifyError("Error saving config", err.message);
    },
  });

  const {
    handleSubmit,
    control,
    formState: { errors, isLoading },
  } = useForm<FormShape>({
    defaultValues: {
      clientSecret: "",
      name: "",
      clientId: "",
      environment: "SANDBOX",
    },
    resolver: zodResolver(newPayPalConfigInputSchema),
  });

  const onSubmit = (values: FormShape) => {
    mutate({
      name: values.name,
      clientId: values.clientId,
      clientSecret: values.clientSecret,
      environment: values.environment,
    });
  };

  return (
    <Layout.AppSectionCard
      footer={
        <Box display="flex" justifyContent="space-between">
          <Button
            onClick={() => router.push("/")}
            variant="tertiary"
            data-testid="create-avatax-cancel-button"
          >
            Go back
          </Button>
          <Button form="new_paypal_config_form" type="submit">
            {isLoading ? "Saving..." : "Save"}
          </Button>
        </Box>
      }
    >
      <Box id="new_paypal_config_form" as="form" onSubmit={handleSubmit(onSubmit)}>
        <Box display="flex" flexDirection="column" gap={6}>
          <Input
            label={<RequiredInputLabel labelText="Configuration name" />}
            name="name"
            control={control}
            helperText={
              errors.name?.message ??
              "Friendly name of your configuration. For example 'Live' or 'UK Live'."
            }
            error={!!errors.name}
          />
          <Select
            label={<RequiredInputLabel labelText="Environment" />}
            name="environment"
            control={control}
            options={[
              { label: "Sandbox", value: "SANDBOX" },
              { label: "Live", value: "LIVE" },
            ]}
            helperText={
              errors.environment?.message ??
              "Select PayPal environment. Use Sandbox for testing and Live for production."
            }
            error={!!errors.environment}
          />
          <Input
            label={<RequiredInputLabel labelText="Client ID key" />}
            name="clientId"
            control={control}
            helperText={
              errors.clientId?.message ?? "Client ID generated in PayPal dashboard."
            }
            error={!!errors.clientId}
          />
          <Input
            label={<RequiredInputLabel labelText="Client Secret" />}
            name="clientSecret"
            control={control}
            type="password"
            helperText={
              errors.clientSecret?.message ?? "Client Secret generated in PayPal dashboard."
            }
            error={!!errors.clientSecret}
          />
        </Box>
      </Box>
    </Layout.AppSectionCard>
  );
};
