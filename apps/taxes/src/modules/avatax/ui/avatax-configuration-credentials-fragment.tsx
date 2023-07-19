import { Box } from "@saleor/macaw-ui/next";
import { Input } from "@saleor/react-hook-form-macaw";
import React from "react";
import { HelperText } from "./form-helper-text";
import { TextLink } from "@saleor/apps-ui";
import { AppToggle } from "../../ui/app-toggle";
import { useFormContext } from "react-hook-form";
import { AvataxConfig } from "../avatax-connection-schema";
import { FormSection } from "./form-section";

export const AvataxConfigurationCredentialsFragment = () => {
  const { control, formState } = useFormContext<AvataxConfig>();

  return (
    <>
      <FormSection title="Credentials">
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
      </FormSection>
    </>
  );
};
