import { Box, Text } from "@saleor/macaw-ui";
import { Input } from "@saleor/react-hook-form-macaw";
import { type ReactNode } from "react";
import { type Control, type FieldErrors } from "react-hook-form";

import { KeyPrefix } from "../key-prefix";

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

/**
 * Hint that opens with the field name, so the copy still says what the value is when read
 * on its own — the label above is easy to skip past when pasting keys.
 */
export const FieldHint = ({ term, children }: { term: string; children: ReactNode }) => (
  <Text size={2} color="default2">
    <Text size={2} fontWeight="medium">
      {term}
    </Text>{" "}
    {children}
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
        errors.name?.message ?? (
          <FieldHint term="Configuration name">
            is shown in Saleor only, for example “Live” or “UK Live”.
          </FieldHint>
        )
      }
      error={!!errors.name}
    />
    <Input
      label={<RequiredInputLabel labelText="Publishable key" />}
      name="publishableKey"
      control={control}
      disabled={disabled}
      helperText={
        errors.publishableKey?.message ?? (
          <FieldHint term="Publishable key">
            generated in Stripe Dashboard (starting with <KeyPrefix size={2}>pk_live</KeyPrefix> or{" "}
            <KeyPrefix size={2}>pk_test</KeyPrefix>).
          </FieldHint>
        )
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
        restrictedKey.helperText ?? (
          <FieldHint term="Restricted key">
            generated in Stripe Dashboard (starting with <KeyPrefix size={2}>rk_live</KeyPrefix> or{" "}
            <KeyPrefix size={2}>rk_test</KeyPrefix>). Not the secret key.
          </FieldHint>
        )
      }
      error={!!errors.restrictedKey}
    />
  </Box>
);
