import { zodResolver } from "@hookform/resolvers/zod";
import { Box, Text } from "@saleor/macaw-ui";
import { Input } from "@saleor/react-hook-form-macaw";
import { useForm } from "react-hook-form";

import { newStripeConfigInputSchema } from "@/modules/app-config/trpc-handlers/new-stripe-config-input-schema";

export type NewStripeConfigFormShape = {
  restrictedKey: string;
  name: string;
  publishableKey: string;
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

type Props = {
  /** Must match the `form` attribute of the page Savebar confirm button. */
  formId: string;
  disabled?: boolean;
  onSubmit: (values: NewStripeConfigFormShape) => void;
};

export const NewStripeConfigForm = ({ formId, disabled = false, onSubmit }: Props) => {
  const {
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<NewStripeConfigFormShape>({
    defaultValues: {
      restrictedKey: "",
      name: "",
      publishableKey: "",
    },
    resolver: zodResolver(newStripeConfigInputSchema),
  });

  return (
    <Box
      id={formId}
      as="form"
      onSubmit={handleSubmit((values) => {
        if (disabled) {
          return;
        }

        onSubmit(values);
      })}
    >
      <Box display="flex" flexDirection="column" gap={6}>
        <Input
          label={<RequiredInputLabel labelText="Configuration name" />}
          name="name"
          control={control}
          disabled={disabled}
          helperText={
            errors.name?.message ??
            "Friendly name of your configuration. For example 'Live' or 'UK Live'."
          }
          error={!!errors.name}
        />
        <Input
          label={<RequiredInputLabel labelText="Publishable key" />}
          name="publishableKey"
          control={control}
          disabled={disabled}
          helperText={
            errors.publishableKey?.message ?? "Publishable key generated in Stripe dashboard."
          }
          error={!!errors.publishableKey}
        />
        <Input
          label={<RequiredInputLabel labelText="Restricted key" />}
          name="restrictedKey"
          control={control}
          type="password"
          disabled={disabled}
          helperText={
            errors.restrictedKey?.message ?? "Restricted key generated in Stripe dashboard."
          }
          error={!!errors.restrictedKey}
        />
      </Box>
    </Box>
  );
};
