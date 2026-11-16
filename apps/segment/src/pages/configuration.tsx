import { useAppBridge } from "@saleor/app-sdk/app-bridge";
import { useDashboardNotification } from "@saleor/apps-shared/use-dashboard-notification";
import { Callout, type ConfirmButtonTransitionState } from "@saleor/apps-ui-next";
import { Text } from "@saleor/macaw-ui";
import { type NextPage } from "next";
import { useState } from "react";

import { ConfigurationView } from "@/modules/configuration/configuration-view";
import { trpcClient } from "@/modules/trpc/trpc-client";

const ConfigurationPage: NextPage = () => {
  const { appBridgeState } = useAppBridge();
  const { notifySuccess, notifyError } = useDashboardNotification();
  const [saveState, setSaveState] = useState<ConfirmButtonTransitionState>("default");

  const configQuery = trpcClient.configuration.getConfig.useQuery();
  const webhooksQuery = trpcClient.configuration.getWebhookConfig.useQuery();

  const { mutate } = trpcClient.configuration.setOrCreateSegmentWriteKey.useMutation({
    onMutate() {
      setSaveState("loading");
    },
    async onSuccess() {
      setSaveState("success");
      notifySuccess("Configuration saved");
      await Promise.all([configQuery.refetch(), webhooksQuery.refetch()]);
    },
    onError(error) {
      setSaveState("error");
      notifyError("Error saving configuration", error.message);
    },
  });

  if (!appBridgeState) {
    return null;
  }

  const fallback =
    appBridgeState.user?.permissions.includes("MANAGE_APPS") === false ? (
      <Callout type="error" title="You do not have permission to access this page">
        <Text size={2}>
          Ask a staff member with the MANAGE_APPS permission to configure Segment.
        </Text>
      </Callout>
    ) : configQuery.isError ? (
      <Callout type="error" title="Could not load the configuration">
        <Text size={2}>{configQuery.error.message}</Text>
      </Callout>
    ) : undefined;

  return (
    <ConfigurationView
      writeKey={configQuery.isLoading ? undefined : configQuery.data?.segmentWriteKey ?? ""}
      webhooksActive={webhooksQuery.data?.areWebhooksActive}
      fallback={fallback}
      saveState={saveState}
      onSave={(writeKey) => mutate(writeKey)}
    />
  );
};

export default ConfigurationPage;
