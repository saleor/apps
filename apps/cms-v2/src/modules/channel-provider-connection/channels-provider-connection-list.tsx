import { useDashboardNotification } from "@saleor/apps-shared";
import { ButtonsBox, Layout, SkeletonLayout } from "@saleor/apps-ui";
import { Box, Button, Text } from "@saleor/macaw-ui";
import { useState } from "react";
import { trpcClient } from "../trpc/trpc-client";
import { AddConnectionModal } from "./add-connection-modal";
import { ChanelProviderConnectionsSectionHeader } from "./channel-provider-connections-section-header";
import { ConnectionsList } from "./connections-list";

const NoConnections = (props: { onCreate(): void; enabled: boolean }) => (
  <Box>
    <ChanelProviderConnectionsSectionHeader />
    <Text as="p">
      No channels connected yet.{" "}
      {!props.enabled &&
        "Ensure you have created a provider configuration that can be connected first."}
    </Text>
  </Box>
);

export const ChannelProviderConnectionList = () => {
  const [dialogOpen, setDialogOpen] = useState(false);

  const {
    data: connectionsData,
    refetch: refetchConnections,
    isLoading,
  } = trpcClient.channelsProvidersConnection.fetchConnections.useQuery();

  const { mutate: removeConnection } =
    trpcClient.channelsProvidersConnection.removeConnection.useMutation({
      onSuccess() {
        refetchConnections();
        notifySuccess("Success", "Removed connection");
      },
    });
  const { notifySuccess } = useDashboardNotification();

  // Prefetch
  trpcClient.channelsProvidersConnection.fetchAllChannels.useQuery();
  const { data: providers } = trpcClient.providersConfigs.getAll.useQuery();

  if (!providers) {
    return <SkeletonLayout.Section />;
  }

  const handleDelete = (connectionId: string) => {
    removeConnection({ id: connectionId });
  };

  if (isLoading || !connectionsData) {
    return <SkeletonLayout.Section />;
  }

  return (
    <Layout.AppSectionCard
      footer={
        providers.length > 0 && (
          <ButtonsBox>
            <Button
              onClick={() => {
                setDialogOpen(true);
              }}
            >
              Add connection
            </Button>
          </ButtonsBox>
        )
      }
    >
      {dialogOpen && (
        <AddConnectionModal
          onClose={() => {
            setDialogOpen(false);
          }}
          onSuccess={() => {
            refetchConnections();
            notifySuccess("Success", "Connection created");
            setDialogOpen(false);
          }}
        />
      )}
      {connectionsData.length === 0 && (
        <NoConnections
          enabled={providers.length > 0}
          onCreate={() => {
            setDialogOpen(true);
          }}
        />
      )}
      {connectionsData.length > 0 && <ConnectionsList onRemove={handleDelete} />}
    </Layout.AppSectionCard>
  );
};
