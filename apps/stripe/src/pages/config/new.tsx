import { Layout } from "@saleor/apps-ui";
import { Box, Text } from "@saleor/macaw-ui";
import { NextPage } from "next";

import { AppBreadcrumbs } from "@/modules/ui/app-breadcrumbs";
import { NewStripeConfigForm } from "@/modules/ui/stripe-configs/new-stripe-config-form";

const NewConfiguration: NextPage = () => {
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
        heading="Adding Stripe configuration"
        sideContent={<Text>Provide required settings to configure Stripe</Text>}
      >
        <NewStripeConfigForm />
      </Layout.AppSection>
    </Box>
  );
};

export default NewConfiguration;
