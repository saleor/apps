import { Layout } from "@saleor/apps-ui";
import { Box, Text } from "@saleor/macaw-ui";
import { NextPage } from "next";

import { AppBreadcrumbs } from "@/modules/ui/app-breadcrumbs";
import { NewConfigForm } from "@/modules/ui/new-config-form";
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
            label: "New Configuration",
          },
        ]}
      />

      <Layout.AppSection
        marginBottom={14}
        heading="Configuration"
        sideContent={
          <Box display="flex" flexDirection="column" gap={4}>
            <Text>
              <strong>Merchant Code, SP Code, Terminal ID</strong>: you will receive those
              credentials while enrolling in Net Protections
            </Text>

            <Text>
              <strong>Use sandbox</strong>: when enabled, transactions will be targeting the Net
              Protections test environment.
            </Text>

            <Text>
              <strong>Shipping company code</strong>: this field indicates which shipping carrier
              should appear in the fulfillment reports.
            </Text>

            <Text>
              <strong>Product SKU as name</strong>: by default, Saleor is using the product name as
              a description of the line item. You can use this option to use SKU instead.
            </Text>
          </Box>
        }
      >
        <NewConfigForm />
      </Layout.AppSection>
    </Box>
  );
};

export default NewConfiguration;
