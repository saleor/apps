import { Layout, TextLink } from "@saleor/apps-ui";
import { Box, Text } from "@saleor/macaw-ui";
import { NextPage } from "next";

import { AppBreadcrumbs } from "@/modules/ui/app-breadcrumbs";
import { NewPayPalConfigForm } from "@/modules/ui/paypal-configs/new-paypal-config-form";
import { useHasAppAccess } from "@/modules/ui/use-has-app-access";

const NewConfiguration: NextPage = () => {
  const { haveAccessToApp } = useHasAppAccess();

  if (!haveAccessToApp) {
    return <Text>You do not have permission to access this page.</Text>;
  }

  return (
    <Box>
      <AppBreadcrumbs
        marginBottom={12}
        breadcrumbs={[
          {
            label: "Configuration",
            href: "/config",
          },
          {
            label: "New PayPal Configuration",
          },
        ]}
      />

      <Layout.AppSection
        marginBottom={14}
        heading="PayPal configuration"
        sideContent={
          <Box display="flex" flexDirection="column" gap={4}>
            <Text>
              Consult PayPal{" "}
              <TextLink href="https://developer.paypal.com/api/rest/" newTab>
                documentation
              </TextLink>{" "}
              to learn more about Client ID and Client Secret keys.
            </Text>

            <Box>
              <Text>
                Check PayPal integration requirements in Saleor app
                <TextLink
                  href="https://docs.saleor.io/developer/app-store/apps/paypal/configuration"
                  newTab
                >
                  {" "}
                  configuration documentation
                </TextLink>
                .
              </Text>
            </Box>
          </Box>
        }
      >
        <NewPayPalConfigForm />
      </Layout.AppSection>
    </Box>
  );
};

export default NewConfiguration;