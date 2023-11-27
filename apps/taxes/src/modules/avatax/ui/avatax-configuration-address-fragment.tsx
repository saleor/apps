import { useDashboardNotification } from "@saleor/apps-shared";
import { Box, Button, Text } from "@saleor/macaw-ui";
import { Input } from "@saleor/react-hook-form-macaw";
import { AddressResolutionModel } from "avatax/lib/models/AddressResolutionModel";
import React from "react";
import { useFormContext } from "react-hook-form";
import { errorUtils } from "../../../lib/error-utils";
import { CountrySelect } from "../../ui/country-select";
import { AvataxConfig } from "../avatax-connection-schema";
import { useAvataxConfigurationStatus } from "./configuration-status";
import { FormSection } from "./form-section";
import { AvataxAddressResolutionProcessor } from "./avatax-address-resolution-processor";

const FieldSuggestion = ({ suggestion }: { suggestion: string }) => {
  return (
    <Box alignItems={"center"} display={"flex"} justifyContent={"space-between"} marginTop={1}>
      <Text paddingLeft={2} color="textNeutralSubdued" variant="caption">
        {suggestion}
      </Text>
    </Box>
  );
};

export type AddressSuggestions = AvataxConfig["address"];

const avataxAddressResolutionProcessor = new AvataxAddressResolutionProcessor();

type AvataxConfigurationAddressFragmentProps = {
  onValidateAddress: (address: AvataxConfig) => Promise<AddressResolutionModel>;
  isLoading: boolean;
};

export const AvataxConfigurationAddressFragment = (
  props: AvataxConfigurationAddressFragmentProps
) => {
  const { control, formState, getValues, setValue, watch } = useFormContext<AvataxConfig>();
  const { status, setStatus } = useAvataxConfigurationStatus();
  const [suggestions, setSuggestions] = React.useState<AddressSuggestions>();

  const { notifyError, notifySuccess, notifyInfo } = useDashboardNotification();

  React.useEffect(() => {
    const subscription = watch((_, { name, type }) => {
      // Force user to reverify when address is changed
      if (
        /*
         * Type is undefined when the fields change is programmatic, so in "applyClickHandler". We don't want to
         * reverify in this case.
         */
        type !== undefined &&
        (name === "address.city" ||
          name === "address.country" ||
          name === "address.state" ||
          name === "address.street" ||
          name === "address.zip")
      ) {
        setSuggestions(undefined);
        setStatus("authenticated");
      }
    });

    return () => subscription.unsubscribe();
  }, [setStatus, watch]);

  const verifyClickHandler = React.useCallback(async () => {
    const config = getValues();

    try {
      const result = await props.onValidateAddress(config);

      const { type, message } =
        avataxAddressResolutionProcessor.resolveAddressResolutionMessage(result);

      if (type === "info") {
        notifyInfo("Address verified", message);
      }

      if (type === "success") {
        notifySuccess("Address verified", message);
      }

      setSuggestions(avataxAddressResolutionProcessor.extractSuggestionsFromResponse(result));
      setStatus("address_valid");
    } catch (e) {
      setStatus("address_invalid");
      notifyError("Invalid address", errorUtils.resolveTrpcClientError(e));
    }
  }, [getValues, notifyError, notifyInfo, notifySuccess, props, setStatus]);

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
