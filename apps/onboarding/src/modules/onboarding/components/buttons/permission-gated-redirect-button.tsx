import { useAppBridge } from "@saleor/app-sdk/app-bridge";
import { Button, Tooltip } from "@saleor/macaw-ui";

import { useAppRedirect } from "../../hooks/use-app-redirect";
import { FakeDisabledButton } from "../fake-disabled-button";

type Props = {
  label: string;
  to: string;
  permission: string;
  missingPermissionTooltip: string;
  onClick?: () => void;
};

export const PermissionGatedRedirectButton = ({
  label,
  to,
  permission,
  missingPermissionTooltip,
  onClick,
}: Props) => {
  const { appBridgeState } = useAppBridge();

  const redirect = useAppRedirect();
  const hasPermission = appBridgeState?.user?.permissions.includes(permission);

  if (!hasPermission) {
    return (
      <Tooltip>
        <Tooltip.Trigger>
          <FakeDisabledButton>{label}</FakeDisabledButton>
        </Tooltip.Trigger>
        <Tooltip.Content>
          <Tooltip.Arrow />
          {missingPermissionTooltip}
        </Tooltip.Content>
      </Tooltip>
    );
  }

  return (
    <Button
      variant="primary"
      onClick={() => {
        onClick?.();
        redirect(to);
      }}
    >
      {label}
    </Button>
  );
};
