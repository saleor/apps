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

/**
 * Required fields carry no mark. Optional ones append secondary “(optional)” — same pattern as
 * Dashboard settings forms (asterisks are not used).
 */
const FieldLabel = ({ labelText, optional = false }: { labelText: string; optional?: boolean }) => (
  <Text size={2} color="default2" as="span">
    {optional ? `${labelText} (optional)` : labelText}
  </Text>
);

/**
 * Hint that opens with the field name so the copy still reads when skimmed alone.
 * The term stays the same weight as the rest of the hint — emphasis belongs on values the
 * merchant must recognize while pasting (key prefixes, masked tails), not on restating the label.
 */
export const FieldHint = ({ term, children }: { term: string; children: ReactNode }) => (
  <Text size={2} color="default2">
    {term} {children}
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
      label={<FieldLabel labelText="Configuration name" />}
      name="name"
      control={control}
      disabled={disabled}
      helperText={
        errors.name?.message ??
        "Configuration name is shown in Saleor only, for example “Live” or “UK Live”."
      }
      error={!!errors.name}
    />
    <Input
      label={<FieldLabel labelText="Publishable key" />}
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
      label={<FieldLabel labelText="Restricted key" optional={restrictedKey.optional} />}
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
