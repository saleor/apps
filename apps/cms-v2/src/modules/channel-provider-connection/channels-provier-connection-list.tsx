import { useDashboardNotification } from "@saleor/apps-shared";
import { Box, Button, Text, ArrowRightIcon } from "@saleor/macaw-ui/next";
import { Select } from "@saleor/react-hook-form-macaw";
import React, { forwardRef, useMemo, useRef } from "react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { createProvider } from "../shared/cms-provider";
import { Modal } from "../ui/modal";
import { trpcClient } from "../trpc/trpc-client";
import {
  ChannelProviderConnectionInputType,
  ChannelProviderConnectionConfigSchema,
} from "@/modules/configuration";
import { zodResolver } from "@hookform/resolvers/zod";
import { ButtonsBox } from "../ui/buttons-box";

const FORM_ID = "new-connection-form";

const Header = () => (
  <Text marginBottom={4} as="h2" variant="heading">
    Channels Connections
  </Text>
);

const NoConnections = (props: { onCreate(): void; enabled: boolean }) => (
  <Box>
    <Header />
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

type FormSchema = Omit<ChannelProviderConnectionInputType, "providerType">;

const Form = (props: { defaultValues: FormSchema; onSubmit(values: FormSchema): void }) => {
  const { data: channels } = trpcClient.channelsProvidersConnection.fetchAllChannels.useQuery();
  const { data: providers } = trpcClient.providersConfigs.getAll.useQuery();

  const { handleSubmit, control } = useForm<FormSchema>({
    defaultValues: props.defaultValues,
    resolver: zodResolver(
      ChannelProviderConnectionConfigSchema.NewConnectionInput.omit({ providerType: true })
    ),
  });

  return (
    <Box
      onSubmit={handleSubmit(props.onSubmit)}
      as="form"
      id={FORM_ID}
      display="grid"
      __gridTemplateColumns="1fr auto 1fr"
      gap={4}
      alignItems="center"
    >
      <Select
        required
        size="small"
        control={control}
        name="channelSlug"
        label="Channel"
        options={channels?.map((c) => ({
          value: c.slug,
          label: c.name,
        }))}
      />
      <ArrowRightIcon />
      <Select
        required
        size="small"
        control={control}
        name="providerId"
        label="Provider"
        options={providers?.map((p) => ({
          value: p.id,
          label: p.configName,
        }))}
      />
    </Box>
  );
};

const ConnectionsList = (props: { onRemove(connId: string): void }) => {
  const { data } = trpcClient.channelsProvidersConnection.fetchConnections.useQuery();
  const { data: channels } = trpcClient.channelsProvidersConnection.fetchAllChannels.useQuery();
  const { data: providers } = trpcClient.providersConfigs.getAll.useQuery();

  if (!data || !providers) {
    return null;
  }

  return (
    <Box>
      <Header />
      <Box
        display="grid"
        justifyContent={"space-between"}
        __gridTemplateColumns={"1fr 1fr auto"}
        gap={4}
        alignItems="center"
      >
        <Text variant="caption">Saleor Channel</Text>
        <Text variant="caption">Target CMS</Text>
        <div />
        {data?.map((conn) => {
          const provider = providers.find((p) => p.id === conn.providerId);

          if (!provider) {
            // todo error here
            return null;
          }

          const providerName = createProvider(provider.type).displayName;

          return (
            <React.Fragment key={conn.id}>
              <Text>{channels?.find((c) => c.slug === conn.channelSlug)?.name}</Text>
              <Text>
                <Text>{provider.configName}</Text>
                <Text color="textNeutralSubdued"> ({providerName})</Text>
              </Text>
              <Button onClick={() => props.onRemove(conn.id)} variant="tertiary">
                Remove
              </Button>
            </React.Fragment>
          );
        })}
      </Box>
    </Box>
  );
};

const AddConnectionModal = (props: { onSubmit(values: FormSchema): void; onClose(): void }) => (
  <Modal onClose={props.onClose}>
    <Text as="h2" variant="heading">
      Connect channel with Provider
    </Text>
    <Text as="p" marginBottom={6}>
      Once connected, operations on product variants on this channel will be sent to selected CMS
      platform.
    </Text>
    <Form onSubmit={props.onSubmit} defaultValues={{ channelSlug: "", providerId: "" }} />
    <ButtonsBox marginTop={8}>
      <Button
        variant="tertiary"
        onClick={() => {
          props.onClose();
        }}
      >
        Close
      </Button>
      <Button variant="primary" type="submit" form={FORM_ID}>
        Add connection
      </Button>
    </ButtonsBox>
  </Modal>
);

AddConnectionModal.displayName = "AddConnectionModal";

export const ChannelProviderConnectionList = () => {
  const [dialogOpen, setDialogOpen] = useState(false);

  const { data, refetch } = trpcClient.channelsProvidersConnection.fetchConnections.useQuery();
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

  const handleFormSubmit = (values: FormSchema) => {
    const providerType = providers.find((p) => p.id === values.providerId)?.type;

    if (!providerType) {
      return; //todo
    }

    addProviderMutate({
      ...values,
      providerType,
    });
  };

  const handleDelete = (connId: string) => {
    removeConnection({ id: connId });
  };

  if (!data) {
    // todo loading and error handling
    return null;
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
      {data.length === 0 && (
        <NoConnections
          enabled={providers.length > 0}
          onCreate={() => {
            setDialogOpen(true);
          }}
        />
      )}
      {data.length > 0 && <ConnectionsList onRemove={handleDelete} />}
      {data.length > 0 && (
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
