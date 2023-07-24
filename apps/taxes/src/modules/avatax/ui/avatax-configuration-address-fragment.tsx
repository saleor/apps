import { useDashboardNotification } from "@saleor/apps-shared";
import { Box, Button, Text } from "@saleor/macaw-ui/next";
import { Input } from "@saleor/react-hook-form-macaw";
import { AddressResolutionModel } from "avatax/lib/models/AddressResolutionModel";
import React from "react";
import { useFormContext } from "react-hook-form";
import { CountrySelect } from "../../ui/country-select";
import { AvataxConfig } from "../avatax-connection-schema";
import { FormSection } from "./form-section";
import { useAvataxConfigurationStatus } from "./configuration-status";

const FieldSuggestion = ({ suggestion }: { suggestion: string }) => {
  return (
    <Box alignItems={"center"} display={"flex"} justifyContent={"space-between"} marginTop={1}>
      <Text paddingLeft={2} color="textNeutralSubdued" variant="caption">
        {suggestion}
      </Text>
    </Box>
  );
};

type AddressSuggestions = AvataxConfig["address"];

// todo: test
function extractSuggestionsFromResponse(response: AddressResolutionModel): AddressSuggestions {
  const address = response.validatedAddresses?.[0];

  if (!address) {
    throw new Error("No address found");
  }

  return {
    street: address.line1 + " " + address.line2 + " " + address.line3,
    city: address.city ?? "",
    state: address.region ?? "",
    country: address.country ?? "",
    zip: address.postalCode ?? "",
  };
}

type AvataxConfigurationAddressFragmentProps = {
  onValidateAddress: (address: AvataxConfig) => Promise<AddressResolutionModel>;
  isLoading: boolean;
};

export const AvataxConfigurationAddressFragment = (
  props: AvataxConfigurationAddressFragmentProps
) => {
  const { control, formState, getValues, setValue } = useFormContext<AvataxConfig>();
  const [status, setStatus] = useAvataxConfigurationStatus();
  const [suggestions, setSuggestions] = React.useState<AddressSuggestions>();

  const { notifyError, notifySuccess } = useDashboardNotification();

  const verifyClickHandler = React.useCallback(async () => {
    const config = getValues();

    try {
      const result = await props.onValidateAddress(config);

      notifySuccess("Address verified");
      setSuggestions(extractSuggestionsFromResponse(result));
      setStatus("address_valid");
    } catch (error) {
      setStatus("address_invalid");
      notifyError("Invalid address");
    }
  }, [getValues, notifyError, notifySuccess, props, setStatus]);

  const applyClickHandler = React.useCallback(() => {
    setStatus("address_verified");
    setSuggestions(undefined);
    setValue("address", {
      city: suggestions?.city ?? "",
      country: suggestions?.country ?? "",
      state: suggestions?.state ?? "",
      street: suggestions?.street ?? "",
      zip: suggestions?.zip ?? "",
    });
  }, [setStatus, setValue, suggestions]);

  const rejectClickHandler = React.useCallback(() => {
    setStatus("address_verified");
    setSuggestions(undefined);
  }, [setStatus]);

  const disabled = status === "not_authenticated";

  return (
    <>
      <FormSection
        title="Address"
        disabled={disabled}
        subtitle={disabled ? "You must verify your Credentials first." : ""}
      >
        <Box display="flex" flexDirection={"column"}>
          <Input
            control={control}
            disabled={disabled}
            name="address.street"
            label="Street"
            helperText={formState.errors.address?.street?.message}
          />
          {suggestions?.street && <FieldSuggestion suggestion={suggestions.street} />}
        </Box>
        <Box>
          <Input
            control={control}
            disabled={disabled}
            name="address.city"
            label="City"
            helperText={formState.errors.address?.city?.message}
          />
          {suggestions?.city && <FieldSuggestion suggestion={suggestions.city} />}
        </Box>
        <Box>
          <Input
            control={control}
            disabled={disabled}
            name="address.state"
            label="State"
            helperText={formState.errors.address?.state?.message}
          />
          {suggestions?.state && <FieldSuggestion suggestion={suggestions.state} />}
        </Box>

        <CountrySelect
          control={control}
          disabled={disabled}
          name="address.country"
          label="Country"
          helperText={formState.errors.address?.country?.message}
        />
        <Box>
          <Input
            control={control}
            disabled={disabled}
            name="address.zip"
            label="Zip"
            helperText={formState.errors.address?.zip?.message}
          />
          {suggestions?.zip && <FieldSuggestion suggestion={suggestions.zip} />}
        </Box>
      </FormSection>
      <Box display={"flex"} flexDirection={"column"} gap={6} marginTop={8}>
        {status !== "address_valid" && (
          <Box alignItems={"center"} display="flex" justifyContent={"flex-end"}>
            <Button
              disabled={props.isLoading || status === "not_authenticated"}
              onClick={verifyClickHandler}
              variant="secondary"
            >
              {props.isLoading ? "Verifying..." : "Verify"}
            </Button>
          </Box>
        )}
        {suggestions && (
          <Box display={"flex"} justifyContent={"flex-end"}>
            <Box display={"flex"} gap={4}>
              <Button variant="secondary" onClick={rejectClickHandler}>
                Reject suggestions
              </Button>
              <Button onClick={applyClickHandler} variant="primary">
                Apply suggestions
              </Button>
            </Box>
          </Box>
        )}
      </Box>
    </>
  );
};
