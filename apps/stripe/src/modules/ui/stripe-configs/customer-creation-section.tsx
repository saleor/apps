import { Callout, DetailSettingToggleRow, SettingsSection } from "@saleor/apps-ui-next";
import { type Control, Controller } from "react-hook-form";

import { type StripeConfigFormShape } from "./stripe-config-fields";

/**
 * Tells whether a tRPC save failed because the restricted key can't create Stripe customers.
 */
export const isMissingCustomersPermissionError = (error: { data?: { code?: string } | null }) =>
  error.data?.code === "PRECONDITION_FAILED";

type Props = {
  control: Control<StripeConfigFormShape>;
  disabled: boolean;
  /** Server message from the last save rejected for a missing permission. */
  permissionError: string | null;
  onToggle: () => void;
};

export const CustomerCreationSection = ({
  control,
  disabled,
  permissionError,
  onToggle,
}: Props) => (
  <SettingsSection
    title="Customers"
    ownership="channel"
    description="What Stripe receives about the buyer of each payment."
    data-test-id="stripe-config-customers-card"
  >
    <Controller
      control={control}
      name="customerCreationEnabled"
      render={({ field }) => (
        <DetailSettingToggleRow
          title="Create Stripe customers"
          description="Attaches a Stripe customer with the buyer's name, email, phone and addresses to payments from signed-in buyers, so they show in Stripe Dashboard. Each buyer keeps one customer across orders. Guest payments stay as Stripe guest customers, so their name comes from the billing details the storefront sends. Needs the “Customers - Write” permission on the restricted key."
          pressed={field.value ?? false}
          onPressedChange={(pressed) => {
            onToggle();
            field.onChange(pressed);
          }}
          disabled={disabled}
          testId="stripe-customer-creation-toggle"
          notice={
            permissionError ? (
              <Callout type="warning" title="Customer creation is off">
                {permissionError}
              </Callout>
            ) : undefined
          }
        />
      )}
    />
  </SettingsSection>
);
