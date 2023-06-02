import { zodResolver } from "@hookform/resolvers/zod";
import { TextLink } from "@saleor/apps-ui";
import { Box, Button, Divider, Text } from "@saleor/macaw-ui/next";
import { Input } from "@saleor/react-hook-form-macaw";
import React from "react";
import { useForm } from "react-hook-form";
import { AppCard } from "../../ui/app-card";
import { AppToggle } from "../../ui/app-toggle";

import { CountrySelect } from "../../ui/country-select";
import { useRouter } from "next/router";
import { TaxJarConfig, defaultTaxJarConfig, taxJarConfigSchema } from "../taxjar-config";

const HelperText = ({ children }: { children: React.ReactNode }) => {
  return (
    <Text color="textNeutralSubdued" fontWeight={"captionLarge"}>
      {children}
    </Text>
  );
};

type TaxJarConfigurationFormProps = {
  onSubmit: (data: TaxJarConfig) => void;
  defaultValues?: TaxJarConfig;
  isLoading: boolean;
};

export const TaxJarConfigurationForm = (props: TaxJarConfigurationFormProps) => {
  const router = useRouter();
  const { handleSubmit, control, formState, reset } = useForm({
    defaultValues: defaultTaxJarConfig,
    resolver: zodResolver(taxJarConfigSchema),
  });

  React.useEffect(() => {
    if (props.defaultValues) {
      reset(props.defaultValues);
    }
  }, [props.defaultValues, reset]);

  const submitHandler = (data: TaxJarConfig) => {
    props.onSubmit(data);
  };

  return (
    <AppCard>
      <form onSubmit={handleSubmit(submitHandler)}>
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
          <Box paddingY={4} display={"flex"} flexDirection={"column"} gap={10}>
            <div>
              <Input
                control={control}
                name="credentials.apiKey"
                required
                label="API Key *"
                helperText={formState.errors.credentials?.apiKey?.message}
              />
            </div>
          </Box>
          <Box paddingY={4} display={"flex"} flexDirection={"column"} gap={10}>
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
          <Button onClick={() => router.push("/configuration")} variant="tertiary">
            Cancel
          </Button>
          <Button type="submit" variant="primary">
            {props.isLoading ? "Saving..." : "Save"}
          </Button>
        </Box>
      </form>
    </AppCard>
  );
};
