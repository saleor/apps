import { Layout, TextLink } from "@saleor/apps-ui";
import { Box, Text } from "@saleor/macaw-ui";
import { NextPage } from "next";

import { AppBreadcrumbs } from "@/modules/ui/app-breadcrumbs";
import { NewStripeConfigForm } from "@/modules/ui/stripe-configs/new-stripe-config-form";
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
            label: "New Stripe Configuration",
          },
        ]}
      />

      <Layout.AppSection
        marginBottom={14}
        heading="Stripe configuration"
        sideContent={
          <Box display="flex" flexDirection="column" gap={4}>
            <Text>
              Consult Stripe{" "}
              <TextLink href="https://docs.stripe.com/keys" newTab>
                documentation
              </TextLink>{" "}
              to learn more about Publishable and Restricted keys.
            </Text>

            <Box>
              <Text>
                Check required Restricted key scopes in Saleor app
                <TextLink
                  href="https://docs.saleor.io/developer/app-store/apps/stripe/overview"
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
        <NewStripeConfigForm />
      </Layout.AppSection>
    </Box>
  );
};

export default NewConfiguration;
