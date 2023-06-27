import { zodResolver } from "@hookform/resolvers/zod";
import { TextLink } from "@saleor/apps-ui";
import { Box, Button, Divider, Text } from "@saleor/macaw-ui/next";
import { Input } from "@saleor/react-hook-form-macaw";
import React from "react";
import { useForm } from "react-hook-form";
import { AppCard } from "../../ui/app-card";
import { AppToggle } from "../../ui/app-toggle";
import { CountrySelect } from "../../ui/country-select";
import { ProviderLabel } from "../../ui/provider-label";
import { AvataxConfig, avataxConfigSchema, defaultAvataxConfig } from "../avatax-connection-schema";

const HelperText = ({ children }: { children: React.ReactNode }) => {
  return (
    <Text color="textNeutralSubdued" fontWeight={"captionLarge"}>
      {children}
    </Text>
  );
};

type AvataxConfigurationFormProps = {
  onSubmit: (data: AvataxConfig) => void;
  defaultValues: AvataxConfig;
  isLoading: boolean;
  leftButton: React.ReactNode;
};

export const AvataxConfigurationForm = (props: AvataxConfigurationFormProps) => {
  const { handleSubmit, control, formState, reset } = useForm({
    defaultValues: defaultAvataxConfig,
    resolver: zodResolver(avataxConfigSchema),
  });

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
        <Text marginBottom={4} as="h3" variant="heading">
          Credentials
        </Text>
        <Box display="grid" gridTemplateColumns={2} gap={12}>
          <Box paddingY={4} display={"flex"} flexDirection={"column"} gap={10}>
            <div>
              <Input
                control={control}
                name="credentials.username"
                required
                label="Username *"
                helperText={formState.errors.credentials?.username?.message}
              />
              <HelperText>
                You can obtain it in the <i>API Keys</i> section of <i>Settings</i> → <i>License</i>{" "}
                in your Avalara Dashboard.
              </HelperText>
            </div>
            <div>
              <Input
                control={control}
                name="credentials.password"
                type="password"
                required
                label="Password *"
                helperText={formState.errors.credentials?.password?.message}
              />
              <HelperText>
                You can obtain it in the <i>API Keys</i> section of <i>Settings</i> → <i>License</i>{" "}
                in your Avalara Dashboard.
              </HelperText>
            </div>

            <div>
              <Input
                control={control}
                name="companyCode"
                label="Company name"
                helperText={formState.errors.companyCode?.message}
              />
              <HelperText>
                When not provided, the default company will be used.{" "}
                <TextLink
                  newTab
                  href="https://developer.avalara.com/erp-integration-guide/sales-tax-badge/transactions/simple-transactions/company-codes/"
                >
                  Read more
                </TextLink>{" "}
                about company codes.
              </HelperText>
            </div>
          </Box>
          <Box paddingY={4} display={"flex"} flexDirection={"column"} gap={10}>
            <AppToggle
              control={control}
              label="Use sandbox mode"
              helperText={
                <HelperText>
                  Toggling between{" "}
                  <TextLink
                    href="https://developer.avalara.com/erp-integration-guide/sales-tax-badge/authentication-in-avatax/sandbox-vs-production/"
                    newTab
                  >
                    <q>Production</q> and <q>Sandbox</q>
                  </TextLink>{" "}
                  environment.
                </HelperText>
              }
              name="isSandbox"
            />

            <AppToggle
              control={control}
              label="Autocommit"
              helperText={
                <HelperText>
                  If enabled, the order will be automatically{" "}
                  <TextLink
                    href="https://developer.avalara.com/communications/dev-guide_rest_v2/commit-uncommit/"
                    newTab
                  >
                    commited to Avalara.
                  </TextLink>{" "}
                </HelperText>
              }
              name="isAutocommit"
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
        <Text marginBottom={4} as="h3" variant="heading">
          Tax codes
        </Text>
        <Box paddingY={4} display={"grid"} gridTemplateColumns={2} gap={12}>
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
        </Box>
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
    </AppCard>
  );
};
