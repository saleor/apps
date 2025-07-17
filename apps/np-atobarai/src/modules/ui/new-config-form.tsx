import { zodResolver } from "@hookform/resolvers/zod";
import { useDashboardNotification } from "@saleor/apps-shared/use-dashboard-notification";
import { Layout } from "@saleor/apps-ui";
import { Box, Button, Text } from "@saleor/macaw-ui";
import { Combobox, Input, Toggle, ToggleProps } from "@saleor/react-hook-form-macaw";
import { useRouter } from "next/router";
import { useForm } from "react-hook-form";

import {
  NewConfigInput,
  newConfigInputSchema,
} from "@/modules/app-config/trpc-handlers/new-config-input-schema";
import { SHIPPING_COMPANY_CODES } from "@/modules/atobarai/shipping-company-codes";
import { trpcClient } from "@/modules/trpc/trpc-client";

type FormShape = NewConfigInput;

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

const DecoratedToggle = ({ label, ...toggleProps }: ToggleProps<FormShape> & { label: string }) => {
  return (
    <Box as="label" display="flex" gap={2} cursor="pointer">
      <Toggle type="button" {...toggleProps} />
      <Text size={2} color="default2">
        {label}
      </Text>
    </Box>
  );
};

const formattedCodes = SHIPPING_COMPANY_CODES.map(([code, companyName]) => {
  return {
    value: code as string,
    label: `${companyName} (${code})` as string,
  };
});

export const NewConfigForm = () => {
  const router = useRouter();
  const { notifyError, notifySuccess } = useDashboardNotification();

  const { mutate } = trpcClient.appConfig.saveNewConfig.useMutation({
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
      name: "",
      merchantCode: "",
      shippingCompanyCode: "",
      skuAsName: false,
      secretSpCode: "",
      terminalId: "",
      useSandbox: true,
    },
    resolver: zodResolver(newConfigInputSchema),
  });

  const onSubmit = (values: FormShape) => {
    mutate({
      name: values.name,
      merchantCode: values.merchantCode,
      shippingCompanyCode: values.shippingCompanyCode,
      skuAsName: values.skuAsName,
      secretSpCode: values.secretSpCode,
      terminalId: values.terminalId,
      useSandbox: values.useSandbox,
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
          <Button form="new_config_form" type="submit">
            {isLoading ? "Saving..." : "Save"}
          </Button>
        </Box>
      }
    >
      <Box id="new_config_form" as="form" onSubmit={handleSubmit(onSubmit)}>
        <Box display="flex" flexDirection="column" gap={6}>
          <Input
            label={<RequiredInputLabel labelText="Configuration name" />}
            name="name"
            control={control}
            helperText={
              errors.name?.message ??
              "Friendly name of your configuration. For example 'JP PROD' or 'JP TEST'."
            }
            error={!!errors.name}
          />

          <Combobox
            label={<RequiredInputLabel labelText="Shipping company code" />}
            name="shippingCompanyCode"
            control={control}
            helperText={errors.name?.message}
            error={!!errors.name}
            options={formattedCodes}
          />

          <Input
            label={<RequiredInputLabel labelText="Merchant code" />}
            name="merchantCode"
            control={control}
            helperText={errors.name?.message}
            error={!!errors.name}
          />

          <Input
            label={<RequiredInputLabel labelText="SP Code" />}
            name="secretSpCode"
            control={control}
            helperText={errors.name?.message}
            error={!!errors.name}
            type="password"
          />

          <Input
            label={<RequiredInputLabel labelText="Terminal ID" />}
            name="terminalId"
            control={control}
            helperText={errors.name?.message}
            error={!!errors.name}
          />

          <DecoratedToggle control={control} name="skuAsName" label="Fill SKU as name" />
          <DecoratedToggle control={control} name="useSandbox" label="Use sandbox mode" />
        </Box>
      </Box>
    </Layout.AppSectionCard>
  );
};
