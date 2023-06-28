import { zodResolver } from "@hookform/resolvers/zod";
import { TextLink } from "@saleor/apps-ui";
import { Box, Button, Divider, Text } from "@saleor/macaw-ui/next";
import { Input } from "@saleor/react-hook-form-macaw";
import React from "react";
import { useForm } from "react-hook-form";
import { AppCard } from "../../ui/app-card";
import { AppToggle } from "../../ui/app-toggle";

import { CountrySelect } from "../../ui/country-select";
import { TaxJarConfig, defaultTaxJarConfig, taxJarConfigSchema } from "../taxjar-connection-schema";
import { ProviderLabel } from "../../ui/provider-label";

const HelperText = ({ children }: { children: React.ReactNode }) => {
  return (
    <Text color="textNeutralSubdued" fontWeight={"captionLarge"}>
      {children}
    </Text>
  );
};

type TaxJarConfigurationFormProps = {
  onSubmit: (data: TaxJarConfig) => void;
  defaultValues: TaxJarConfig;
  isLoading: boolean;
  leftButton: React.ReactNode;
};

export const TaxJarConfigurationForm = (props: TaxJarConfigurationFormProps) => {
  const { handleSubmit, control, formState, reset } = useForm({
    defaultValues: defaultTaxJarConfig,
    resolver: zodResolver(taxJarConfigSchema),
  });

  React.useEffect(() => {
    reset(props.defaultValues);
  }, [props.defaultValues, reset]);

  const submitHandler = React.useCallback(
    (data: TaxJarConfig) => {
      props.onSubmit(data);
    },
    [props]
  );

  return (
    <AppCard>
      <Box marginBottom={8}>
        <ProviderLabel name="taxjar" />
      </Box>

      <form onSubmit={handleSubmit(submitHandler)} data-testid="taxjar-configuration-form">
        <Input
          control={control}
          name="name"
          required
          label="Configuration name *"
          helperText={formState.errors.name?.message}
        />
        <HelperText>Unique identifier for your provider.</HelperText>
        <Divider marginY={8} />
        <Text marginBottom={4} as="h3" variant="heading">
          Credentials
        </Text>
        <Box display="grid" gridTemplateColumns={2} gap={12}>
          <Box paddingY={4}>
            <Input
              control={control}
              name="credentials.apiKey"
              required
              label="API Key *"
              helperText={formState.errors.credentials?.apiKey?.message}
            />
            <HelperText>
              You can obtain it by following the instructions from{" "}
              <TextLink href="https://support.taxjar.com/article/160-how-do-i-get-a-sales-tax-api-token">
                here
              </TextLink>
              .
            </HelperText>
          </Box>
          <Box paddingY={4}>
            <AppToggle
              control={control}
              label="Use sandbox mode"
              helperText={
                <HelperText>
                  Toggling between{" "}
                  <TextLink href="https://developers.taxjar.com/integrations/testing/" newTab>
                    <q>Production</q> and <q>Sandbox</q>
                  </TextLink>{" "}
                  environment.
                </HelperText>
              }
              name="isSandbox"
            />
          </Box>
        </Box>
        <Divider marginY={8} />
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
        <Divider marginY={8} />
        <Box display={"flex"} justifyContent={"space-between"} alignItems={"center"}>
          {props.leftButton}
          <Button
            disabled={props.isLoading}
            type="submit"
            variant="primary"
            data-testid="taxjar-configuration-save-button"
          >
            {props.isLoading ? "Saving..." : "Save"}
          </Button>
        </Box>
      </form>
    </AppCard>
  );
};
