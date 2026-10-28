import { actions, useAppBridge } from "@saleor/app-sdk/app-bridge";
import { Callout } from "@saleor/apps-ui-next";
import { Button } from "@saleor/macaw-ui";
import { useEffect } from "react";

import { trpcClient } from "@/modules/trpc/trpc-client";

/** Dashboard reloads the app at this path after staff approves or denies the permission. */
const PERMISSION_REQUEST_REDIRECT_PATH = "/config";

/**
 * Installations from before MANAGE_ORDERS was added to the manifest don't get ORDER_CREATED,
 * so payment intents from checkouts never get the order number. Asks staff for the permission
 * and registers the webhook once it's granted. Hidden when both are in place.
 */
export const OrderSyncCallout = () => {
  const { appBridge, appBridgeState } = useAppBridge();
  const utils = trpcClient.useUtils();
  const statusQuery = trpcClient.orderSync.getStatus.useQuery();
  const enableMutation = trpcClient.orderSync.enable.useMutation({
    onSuccess: (status) => utils.orderSync.getStatus.setData(undefined, status),
  });

  const status = statusQuery.data;
  const needsWebhook = status?.hasPermission === true && !status.hasWebhook;

  useEffect(() => {
    if (needsWebhook && enableMutation.isIdle) {
      enableMutation.mutate();
    }
  }, [needsWebhook, enableMutation]);

  if (!status || (status.hasPermission && status.hasWebhook)) {
    return null;
  }

  if (needsWebhook) {
    if (!enableMutation.isError) {
      return null;
    }

    return (
      <Callout
        type="error"
        title="Couldn't turn on order sync to Stripe"
        action={
          <Button variant="secondary" size="small" onClick={() => enableMutation.mutate()}>
            Try again
          </Button>
        }
        data-test-id="order-sync-callout"
      >
        The permission is granted, but the app failed to subscribe to new orders.
      </Callout>
    );
  }

  // Dashboard only lets staff with MANAGE_APPS change app permissions
  const canGrantPermission = appBridgeState?.user?.permissions.includes("MANAGE_APPS") ?? false;

  const requestPermission = () => {
    void appBridge?.dispatch(
      actions.RequestPermissions(["MANAGE_ORDERS"], PERMISSION_REQUEST_REDIRECT_PATH),
    );
  };

  return (
    <Callout
      type="info"
      title="Show Saleor order numbers in Stripe"
      action={
        canGrantPermission ? (
          <Button variant="secondary" size="small" onClick={requestPermission}>
            Grant permission
          </Button>
        ) : undefined
      }
      data-test-id="order-sync-callout"
    >
      Payments from checkout are created in Stripe before the order exists, so they don&apos;t
      include the order number. To add it once the order is placed, the app needs the Manage orders
      permission.
      {canGrantPermission
        ? null
        : " Ask a staff member with the Manage apps permission to grant it."}
    </Callout>
  );
};
