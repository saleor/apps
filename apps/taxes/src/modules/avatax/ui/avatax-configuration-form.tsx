import { zodResolver } from "@hookform/resolvers/zod";
import { TextLink } from "@saleor/apps-ui";
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
import { FormSection } from "./form-section";

type AvataxConfigurationFormProps = {
  onSubmit: (data: AvataxConfig) => void;
  defaultValues: AvataxConfig;
  isLoading: boolean;
  leftButton: React.ReactNode;
};

export const AvataxConfigurationForm = (props: AvataxConfigurationFormProps) => {
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
          <Divider marginY={8} />

          <Box display={"flex"} justifyContent={"space-between"} alignItems={"center"}>
            {props.leftButton}

            <Button
              disabled={props.isLoading}
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
