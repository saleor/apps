import { useDashboardNotification } from "@saleor/apps-shared";
import { Box, Button, Text } from "@saleor/macaw-ui/next";
import { useState } from "react";
import { trpcClient } from "../trpc/trpc-client";
import { ButtonsBox } from "../ui/buttons-box";
import { AddConnectionFormSchema } from "./add-connection-form";
import { AddConnectionModal } from "./add-connection-modal";
import { ChanelProviderConnectionsSectionHeader } from "./channel-provider-connections-section-header";
import { ConnectionsList } from "./connections-list";
import { Skeleton } from "../ui/skeleton";

const NoConnections = (props: { onCreate(): void; enabled: boolean }) => (
  <Box>
    <ChanelProviderConnectionsSectionHeader />
    <Text marginBottom={4} as="p">
      No channels connected yet.{" "}
      {!props.enabled &&
        "Ensure you have created a provider configuration that can be connected first."}
    </Text>
    {props.enabled && (
      <ButtonsBox>
        <Button onClick={props.onCreate}>Create first connection</Button>
      </ButtonsBox>
    )}
  </Box>
);

export const ChannelProviderConnectionList = () => {
  const [dialogOpen, setDialogOpen] = useState(false);

  const { data: connectionsData, refetch: refetchConnections } =
    trpcClient.channelsProvidersConnection.fetchConnections.useQuery();

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
    return <Skeleton.Section />;
  }

  const handleDelete = (connectionId: string) => {
    removeConnection({ id: connectionId });
  };

  if (!connectionsData) {
    return <Text>Loading</Text>;
  }

  return (
    <Box>
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
      {connectionsData.length > 0 && (
        <ButtonsBox marginTop={6}>
          <Button
            onClick={() => {
              setDialogOpen(true);
            }}
          >
            Add connection
          </Button>
        </ButtonsBox>
      )}
    </Box>
  );
};
