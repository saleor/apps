import { Box } from "@saleor/macaw-ui";
import { NextPage } from "next";
import { ComponentProps } from "react";
import { CustomersImporterView } from "../modules/customers/customers-importer-nuvo/customers-importer-view";
import { GraphQLProvider } from "../providers/GraphQLProvider";
import { useAppBridge } from "@saleor/app-sdk/app-bridge";
import { Text } from "@saleor/macaw-ui";

const ImporterPage: NextPage = () => {
  return (
    <div>
      <Box>
        <CustomersImporterView />
      </Box>
    </div>
  );
};

const WrappedPage = (props: ComponentProps<NextPage>) => {
  const { appBridgeState } = useAppBridge();

  if (!appBridgeState) {
    return null;
  }

  if (appBridgeState.user?.permissions.includes("MANAGE_APPS") === false) {
    return <Text>You do not have permission to access this page.</Text>;
  }

  return (
    <GraphQLProvider>
      <ImporterPage {...props} />
    </GraphQLProvider>
  );
};

export default WrappedPage;
