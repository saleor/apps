import { useDashboardNotification } from "@saleor/apps-shared";
import { TextLink } from "@saleor/apps-ui";
import { Box, Button } from "@saleor/macaw-ui/next";
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
            label="Document recording"
            helperText={
              <HelperText>
                When turned off, the document type will always be set to <i>SalesOrder</i>. This
                means the transactions will not be recorded in Avatax.
              </HelperText>
            }
            name="isDocumentRecording"
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
      <Box display="flex" justifyContent={"flex-end"}>
        <Button variant="secondary" onClick={verifyCredentials}>
          {props.isLoading ? "Verifying..." : "Verify"}
        </Button>
      </Box>
    </>
  );
};
