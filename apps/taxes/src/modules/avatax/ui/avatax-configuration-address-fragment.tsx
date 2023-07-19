import { Input } from "@saleor/react-hook-form-macaw";
import { useFormContext } from "react-hook-form";
import { CountrySelect } from "../../ui/country-select";
import { AvataxConfig } from "../avatax-connection-schema";
import { useAvataxConfigurationStatus } from "./avatax-configuration-form";
import { FormSection } from "./form-section";

export const AvataxConfigurationAddressFragment = () => {
  const { control, formState } = useFormContext<AvataxConfig>();
  const [status] = useAvataxConfigurationStatus();

  const disabled = status === "not_authenticated";

  return (
    <>
      <FormSection
        title="Address"
        disabled={disabled}
        subtitle={disabled ? "You must verify your Credentials first." : ""}
      >
        <Input
          control={control}
          disabled={disabled}
          name="address.street"
          label="Street"
          helperText={formState.errors.address?.street?.message}
        />
        <Input
          control={control}
          disabled={disabled}
          name="address.city"
          label="City"
          helperText={formState.errors.address?.city?.message}
        />
        <Input
          control={control}
          disabled={disabled}
          name="address.state"
          label="State"
          helperText={formState.errors.address?.state?.message}
        />
        <CountrySelect
          control={control}
          disabled={disabled}
          name="address.country"
          label="Country"
          helperText={formState.errors.address?.country?.message}
        />
        <Input
          control={control}
          disabled={disabled}
          name="address.zip"
          label="Zip"
          helperText={formState.errors.address?.zip?.message}
        />
      </FormSection>
    </>
  );
};
