import { useDashboardNotification } from "@saleor/apps-shared";
import { TextLink } from "@saleor/apps-ui";
import { Box, Button } from "@saleor/macaw-ui";
import { Input } from "@saleor/react-hook-form-macaw";
import React from "react";
import { useFormContext } from "react-hook-form";
import { errorUtils } from "../../../lib/error-utils";
import { AppToggle } from "../../ui/app-toggle";
import { AvataxConfig, BaseAvataxConfig } from "../avatax-connection-schema";
import { useAvataxConfigurationStatus } from "./configuration-status";
import { HelperText } from "./form-helper-text";
import { FormSection } from "./form-section";

type AvataxConfigurationCredentialsFragmentProps = {
  onValidateCredentials: (input: BaseAvataxConfig) => Promise<void>;
  isLoading: boolean;
};

export const AvataxConfigurationCredentialsFragment = (
  props: AvataxConfigurationCredentialsFragmentProps
) => {
  const { control, formState, getValues, watch } = useFormContext<AvataxConfig>();
  const { setStatus } = useAvataxConfigurationStatus();

  const { notifyError, notifySuccess } = useDashboardNotification();

  React.useEffect(() => {
    const subscription = watch((_, { name }) => {
      // Force user to reverify when credentials are changed
      if (name === "credentials.password" || name === "credentials.username") {
        setStatus("not_authenticated");
      }
    });

    return () => subscription.unsubscribe();
  }, [setStatus, watch]);

  const verifyCredentials = React.useCallback(async () => {
    const value = getValues();

    try {
      await props.onValidateCredentials({
        credentials: value.credentials,
        isSandbox: value.isSandbox,
      });
      notifySuccess("Credentials verified");
      setStatus("authenticated");
    } catch (e) {
      notifyError("Invalid credentials", errorUtils.resolveTrpcClientError(e));

      setStatus("not_authenticated");
    }
  }, [getValues, notifyError, notifySuccess, props, setStatus]);

  return (
    <>
      <FormSection title="Credentials">
        <div>
          <Input
            control={control}
            name="credentials.username"
            required
            label="Username *"
            helperText={formState.errors.credentials?.username?.message}
          />
          <HelperText>
            You can obtain it in the <i>API Keys</i> section of <i>Settings</i> → <i>License</i> in
            your Avalara Dashboard.
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
            You can obtain it in the <i>API Keys</i> section of <i>Settings</i> → <i>License</i> in
            your Avalara Dashboard.
          </HelperText>
        </div>
        <div>
          <Input
            control={control}
            name="companyCode"
            label="Company code"
            helperText={formState.errors.companyCode?.message}
          />
          <HelperText>
            When not provided, the default company code will be used.{" "}
            <TextLink
              newTab
              href="https://developer.avalara.com/erp-integration-guide/sales-tax-badge/transactions/simple-transactions/company-codes/"
            >
              Read more
            </TextLink>{" "}
            about company codes.
          </HelperText>
        </div>
        <AppToggle
          control={control}
          label="Use sandbox mode"
          helperText={
            <HelperText>
              Choose between
              <TextLink
                href="https://developer.avalara.com/erp-integration-guide/sales-tax-badge/authentication-in-avatax/sandbox-vs-production/"
                newTab
              >
                <q>Production</q> and <q>Sandbox</q>
              </TextLink>{" "}
              environment according to your credentials.
            </HelperText>
          }
          name="isSandbox"
        />
      </FormSection>
      <Box display="flex" justifyContent={"flex-end"}>
        <Button variant="secondary" onClick={verifyCredentials}>
          {props.isLoading ? "Verifying..." : "Verify"}
        </Button>
      </Box>
    </>
  );
};
