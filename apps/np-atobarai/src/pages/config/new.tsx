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
            <Text>todo</Text>
          </Box>
        }
      >
        <NewConfigForm />
      </Layout.AppSection>
    </Box>
  );
};

export default NewConfiguration;
