import { useAppBridge, withAuthorization } from "@saleor/app-sdk/app-bridge";
import { ConfigurationView } from "../views/configuration/configuration.view";
import { isInIframe } from "@saleor/apps-shared";
import { Text } from "@saleor/macaw-ui";

const IndexPage = () => {
  const { appBridgeState } = useAppBridge();

  if (isInIframe() && !appBridgeState?.token) {
    return <div>Loading</div>;
  }

  if (!appBridgeState) {
    return null;
  }

  if (appBridgeState.user?.permissions.includes("MANAGE_APPS") === false) {
    return <Text>You do not have permission to access this page.</Text>;
  }

  return <ConfigurationView />;
};

export default withAuthorization({
  notIframe: <div>App can be used in Saleor Dashboard only</div>,
  unmounted: null,
  noDashboardToken: <div>Error authorizing with Saleor Dashboard</div>,
  dashboardTokenInvalid: <div>Error authorizing with Saleor Dashboard</div>,
})(IndexPage);
