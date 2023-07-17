import { useDashboardNotification } from "@saleor/apps-shared";
import { Box, Button, Text } from "@saleor/macaw-ui/next";
import { useState } from "react";
import { trpcClient } from "../trpc/trpc-client";
import { ButtonsBox } from "../ui/buttons-box";
import { AddConnectionFormSchema } from "./add-connection-form";
import { AddConnectionModal } from "./add-connection-modal";
import { ChanelProviderConnectionsSectionHeader } from "./channel-provider-connections-section-header";
import { ConnectionsList } from "./connections-list";

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

  const { data: connectionsData, refetch } =
    trpcClient.channelsProvidersConnection.fetchConnections.useQuery();
  const { mutate: removeConnection } =
    trpcClient.channelsProvidersConnection.removeConnection.useMutation({
      onSuccess() {
        refetch();
        notifySuccess("Success", "Removed connection");
      },
    });
  const { notifySuccess } = useDashboardNotification();

  // Prefetch
  trpcClient.channelsProvidersConnection.fetchAllChannels.useQuery();
  const { data: providers } = trpcClient.providersConfigs.getAll.useQuery();

  const { mutate: addProviderMutate } =
    trpcClient.channelsProvidersConnection.addConnection.useMutation({
      onSuccess() {
        notifySuccess("Success", "Added connection");
        refetch();
        setDialogOpen(false);
      },
    });

  if (!providers) {
    return null;
  }

  const handleFormSubmit = (values: AddConnectionFormSchema) => {
    const providerType = providers.find((p) => p.id === values.providerId)?.type;

    if (!providerType) {
      throw new Error("Provider not found");
    }

    addProviderMutate({
      ...values,
      providerType,
    });
  };

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
          onSubmit={handleFormSubmit}
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
