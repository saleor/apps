import { TextLink } from "@saleor/apps-ui";
import { Input } from "@saleor/react-hook-form-macaw";
import { useFormContext } from "react-hook-form";

import { AppToggle } from "../../ui/app-toggle";
import { AvataxConfig } from "../avatax-connection-schema";
import { useAvataxConfigurationStatus } from "./configuration-status";
import { HelperText } from "./form-helper-text";
import { FormSection } from "./form-section";

export const AvataxConfigurationSettingsFragment = () => {
  const { control, formState } = useFormContext<AvataxConfig>();
  const { status } = useAvataxConfigurationStatus();

  const disabled = status === "not_authenticated";

  return (
    <FormSection title="Settings" disabled={disabled}>
      <AppToggle
        control={control}
        label="Document recording"
        disabled={disabled}
        helperText={
          <HelperText>
            When turned off, the document type will always be set to <i>SalesOrder</i>. This means
            the transactions will not be recorded in AvaTax. Read more{" "}
            <TextLink
              href="https://developer.avalara.com/ecommerce-integration-guide/sales-tax-badge/designing/disable-document-recording/"
              newTab
            >
              here
            </TextLink>
            .
          </HelperText>
        }
        name="isDocumentRecordingEnabled"
      />
      <AppToggle
        control={control}
        label="Autocommit"
        disabled={disabled}
        helperText={
          <HelperText>
            If enabled, the order will be automatically{" "}
            <TextLink
              href="https://developer.avalara.com/communications/dev-guide_rest_v2/commit-uncommit/"
              newTab
            >
              commited to Avalara.
            </TextLink>{" "}
          </HelperText>
        }
        name="isAutocommit"
      />
      <div>
        <Input
          disabled={disabled}
          control={control}
          name="shippingTaxCode"
          label="Shipping tax code"
          helperText={formState.errors.shippingTaxCode?.message}
        />
        <HelperText disabled={disabled}>
          Tax code that for the shipping line sent to AvaTax.{" "}
          <TextLink newTab href="https://taxcode.avatax.avalara.com">
            Must match AvaTax tax codes format.
          </TextLink>
        </HelperText>
      </div>
    </FormSection>
  );
};
