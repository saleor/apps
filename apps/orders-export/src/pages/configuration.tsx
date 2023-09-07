import { AppHeader } from "@/modules/ui/app-header";
import { useAppBridge } from "@saleor/app-sdk/app-bridge";
import { Layout } from "@saleor/apps-ui";
import { Box, Text } from "@saleor/macaw-ui/next";
import { NextPage } from "next";

const ConfigurationPage: NextPage = () => {
  const { appBridgeState } = useAppBridge();

  if (!appBridgeState) {
    return null;
  }

  if (appBridgeState.user?.permissions.includes("MANAGE_APPS") === false) {
    return <Text>You do not have permission to access this page.</Text>;
  }

  return (
    <Box>
      <AppHeader />
      <Layout.AppSection marginBottom={14} heading="todo">
        todo
      </Layout.AppSection>
    </Box>
  );
};

export default ConfigurationPage;
