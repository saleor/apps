import { TextLink } from "@saleor/apps-ui";
import { Input } from "@saleor/react-hook-form-macaw";
import React from "react";
import { useFormContext } from "react-hook-form";
import { AvataxConfig } from "../avatax-connection-schema";
import { HelperText } from "./form-helper-text";
import { FormSection } from "./form-section";

export const AvataxConfigurationTaxesFragment = () => {
  const { control, formState } = useFormContext<AvataxConfig>();

  return (
    <FormSection title="Tax codes">
      <div>
        <Input
          control={control}
          name="shippingTaxCode"
          label="Shipping tax code"
          helperText={formState.errors.shippingTaxCode?.message}
        />
        <HelperText>
          Tax code that for the shipping line sent to Avatax.{" "}
          <TextLink newTab href="https://taxcode.avatax.avalara.com">
            Must match Avatax tax codes format.
          </TextLink>
        </HelperText>
      </div>
    </FormSection>
  );
};
