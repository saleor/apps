import { useAppBridge, actions } from "@saleor/app-sdk/app-bridge";
import { SaleorVersionCompatibilityValidator } from "@saleor/apps-shared";
import { PermissionEnum } from "../../generated/graphql";
import { Text } from "@saleor/macaw-ui";
import { TextLink } from "@saleor/apps-ui";

interface ManagePermissionsTextLinkProps {
  missingPermission: PermissionEnum;
}

/*
 * Returns TextLink component with link to manage permissions if used in compatible dashboard version.
 * Otherwise returns text instructions to reinstall the app.
 */
export const ManagePermissionsTextLink = ({
  missingPermission,
}: ManagePermissionsTextLinkProps) => {
  const { appBridgeState, appBridge } = useAppBridge();
  const dashboardVersion = appBridgeState?.dashboardVersion;

  // Editing app permissions has been introduced in Saleor Dashboard 3.15
  const isPermissionManagementAvailable = dashboardVersion
    ? new SaleorVersionCompatibilityValidator(">=3.15").isValid(dashboardVersion)
    : false;

  const appId = appBridgeState?.id;

  if (!isPermissionManagementAvailable || !appId) {
    return (
      <Text>
        To use this feature, the {missingPermission} permission is required. Please reinstall the
        app.
      </Text>
    );
  }

  return (
    <Text>
      To use this feature, the {missingPermission} permission is required. Please go to{" "}
      {/* TODO: Update the shared package to handle dashboard links */}
      <TextLink
        onClick={(e) => {
          e.preventDefault();

          appBridge?.dispatch(
            actions.Redirect({
              to: `/apps/${appId}`,
            }),
          );
        }}
        href="#"
      >
        Manage App section
      </TextLink>
      , and grant the permission
    </Text>
  );
};
