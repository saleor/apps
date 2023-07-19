import { zodResolver } from "@hookform/resolvers/zod";
import { Box, Button, Divider, Text } from "@saleor/macaw-ui/next";
import { Input } from "@saleor/react-hook-form-macaw";
import React from "react";
import { FormProvider, useForm } from "react-hook-form";
import { AppCard } from "../../ui/app-card";
import { ProviderLabel } from "../../ui/provider-label";
import { AvataxConfig, avataxConfigSchema, defaultAvataxConfig } from "../avatax-connection-schema";
import { AvataxConfigurationAddressFragment } from "./avatax-configuration-address-fragment";
import { AvataxConfigurationCredentialsFragment } from "./avatax-configuration-credentials-fragment";
import { HelperText } from "./form-helper-text";
import { AvataxConfigurationTaxesFragment } from "./avatax-configuration-taxes-fragment";
import { atom, useAtom } from "jotai";

type AvataxConfigurationFormProps = {
  onSubmit: (data: AvataxConfig) => void;
  defaultValues: AvataxConfig;
  isLoading: boolean;
  leftButton: React.ReactNode;
};

const statusAtom = atom<"not_authenticated" | "authenticated">("not_authenticated");

export const useAvataxConfigurationStatus = () => {
  return useAtom(statusAtom);
};

export const AvataxConfigurationForm = (props: AvataxConfigurationFormProps) => {
  const [status] = useAvataxConfigurationStatus();
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
      props.onSubmit(data);
    },
    [props]
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
          <AvataxConfigurationCredentialsFragment />
          <Divider marginY={8} />
          <AvataxConfigurationAddressFragment />
          <Divider marginY={8} />
          <AvataxConfigurationTaxesFragment />
          <Divider marginY={8} />

          <Box display={"flex"} justifyContent={"space-between"} alignItems={"center"}>
            {props.leftButton}

            <Button
              disabled={props.isLoading || status === "not_authenticated"}
              type="submit"
              variant="primary"
              data-testid="avatax-configuration-save-button"
            >
              {props.isLoading ? "Saving..." : "Save"}
            </Button>
          </Box>
        </form>
      </FormProvider>
    </AppCard>
  );
};
