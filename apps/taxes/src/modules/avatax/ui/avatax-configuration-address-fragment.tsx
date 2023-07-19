import { Box, Text } from "@saleor/macaw-ui/next";
import { Input } from "@saleor/react-hook-form-macaw";
import { useFormContext } from "react-hook-form";
import { CountrySelect } from "../../ui/country-select";
import { AvataxConfig } from "../avatax-connection-schema";

export const AvataxConfigurationAddressFragment = () => {
  const { control, formState } = useFormContext<AvataxConfig>();

  return (
    <>
      <Text marginBottom={4} as="h3" variant="heading">
        Address
      </Text>
      <Box paddingY={4} display={"grid"} gridTemplateColumns={2} gap={12}>
        <Input
          control={control}
          required
          name="address.street"
          label="Street *"
          helperText={formState.errors.address?.street?.message}
        />
        <Input
          control={control}
          required
          name="address.city"
          label="City *"
          helperText={formState.errors.address?.city?.message}
        />
        <Input
          control={control}
          required
          name="address.state"
          label="State *"
          helperText={formState.errors.address?.state?.message}
        />
        <CountrySelect
          control={control}
          required
          name="address.country"
          label="Country *"
          helperText={formState.errors.address?.country?.message}
        />
        <Input
          control={control}
          required
          name="address.zip"
          label="Zip *"
          helperText={formState.errors.address?.zip?.message}
        />
      </Box>
    </>
  );
};
