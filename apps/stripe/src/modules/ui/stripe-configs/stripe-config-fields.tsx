import { Box, Text } from "@saleor/macaw-ui";
import { Input } from "@saleor/react-hook-form-macaw";
import { type ReactNode } from "react";
import { type Control, type FieldErrors } from "react-hook-form";

export type StripeConfigFormShape = {
  name: string;
  publishableKey: string;
  restrictedKey: string;
};

const RequiredInputLabel = ({ labelText }: { labelText: string }) => (
  <Box>
    <Text size={2} color="default2">
      {labelText}
    </Text>{" "}
    <Text size={2} color="critical2">
      *
    </Text>
  </Box>
);

const OptionalInputLabel = ({ labelText }: { labelText: string }) => (
  <Text size={2} color="default2">
    {labelText}
  </Text>
);

type Props = {
  control: Control<StripeConfigFormShape>;
  errors: FieldErrors<StripeConfigFormShape>;
  disabled?: boolean;
  /**
   * Editing an existing configuration cannot prefill the restricted key - only its last
   * characters ever reach the browser - so there the field is optional and empty means "keep the
   * saved key".
   */
  restrictedKey?: {
    optional?: boolean;
    helperText?: ReactNode;
  };
};

export const StripeConfigFields = ({
  control,
  errors,
  disabled = false,
  restrictedKey = {},
}: Props) => (
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
      label={
        restrictedKey.optional ? (
          <OptionalInputLabel labelText="Restricted key" />
        ) : (
          <RequiredInputLabel labelText="Restricted key" />
        )
      }
      name="restrictedKey"
      control={control}
      type="password"
      disabled={disabled}
      helperText={
        errors.restrictedKey?.message ??
        restrictedKey.helperText ??
        "Restricted key generated in Stripe dashboard."
      }
      error={!!errors.restrictedKey}
    />
  </Box>
);
