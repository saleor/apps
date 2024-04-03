import { zodResolver } from "@hookform/resolvers/zod";
import { Box, Button, Divider } from "@saleor/macaw-ui";
import { Input } from "@saleor/react-hook-form-macaw";
import { AddressResolutionModel } from "avatax/lib/models/AddressResolutionModel";
import React from "react";
import { FormProvider, useForm } from "react-hook-form";
import { AppCard } from "../../ui/app-card";
import { ProviderLabel } from "../../ui/provider-label";
import {
  AvataxConfig,
  avataxConfigSchema,
  BaseAvataxConfig,
  defaultAvataxConfig,
} from "../avatax-connection-schema";
import { AvataxConfigurationAddressFragment } from "./avatax-configuration-address-fragment";
import { AvataxConfigurationCredentialsFragment } from "./avatax-configuration-credentials-fragment";
import { AvataxConfigurationSettingsFragment } from "./avatax-configuration-settings-fragment";
import { useAvataxConfigurationStatus } from "./configuration-status";
import { HelperText } from "./form-helper-text";

type AvataxConfigurationFormProps = {
  submit: {
    handleFn: (data: AvataxConfig) => void;
    isLoading: boolean;
  };
  validateAddress: {
    handleFn: (config: AvataxConfig) => Promise<AddressResolutionModel>;
    isLoading: boolean;
  };
  validateCredentials: {
    handleFn: (config: BaseAvataxConfig) => Promise<void>;
    isLoading: boolean;
  };
  defaultValues: AvataxConfig;
  leftButton: React.ReactNode;
};

export const AvataxConfigurationForm = (props: AvataxConfigurationFormProps) => {
  const { status } = useAvataxConfigurationStatus();
  const formMethods = useForm({
    defaultValues: defaultAvataxConfig,
    resolver: zodResolver(avataxConfigSchema),
  });

  const { handleSubmit, control, formState, reset } = formMethods;

  React.useEffect(() => {
    reset(props.defaultValues);
  }, [props.defaultValues, reset]);

  const submitHandler = React.useCallback(
    (data: AvataxConfig) => {
      props.submit.handleFn(data);
    },
    [props],
  );

  return (
    <AppCard>
      <Box marginBottom={8}>
        <ProviderLabel name="avatax" />
      </Box>
      <FormProvider {...formMethods}>
        <form onSubmit={handleSubmit(submitHandler)} data-testid="avatax-configuration-form">
          <Input
            control={control}
            name="name"
            required
            label="Configuration name *"
            helperText={formState.errors.name?.message}
          />
          <HelperText>Unique identifier for your provider.</HelperText>
          <Divider marginY={8} />
          <AvataxConfigurationCredentialsFragment
            onValidateCredentials={props.validateCredentials.handleFn}
            isLoading={props.validateCredentials.isLoading}
          />
          <Divider marginY={8} />
          <AvataxConfigurationSettingsFragment />
          <Divider marginY={8} />
          <AvataxConfigurationAddressFragment
            onValidateAddress={props.validateAddress.handleFn}
            isLoading={props.validateAddress.isLoading}
          />
          <Divider marginY={8} />

          <Box display={"flex"} justifyContent={"space-between"} alignItems={"center"}>
            {props.leftButton}

            <Button
              disabled={props.submit.isLoading || status !== "address_verified"}
              type="submit"
              variant="primary"
              data-testid="avatax-configuration-save-button"
            >
              {props.submit.isLoading ? "Saving..." : "Save"}
            </Button>
          </Box>
        </form>
      </FormProvider>
    </AppCard>
  );
};
