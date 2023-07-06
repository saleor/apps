import { useDashboardNotification } from "@saleor/apps-shared";
import { Box, Button, Text, ArrowRightIcon } from "@saleor/macaw-ui/next";
import { Select } from "@saleor/react-hook-form-macaw";
import React, { useMemo, useRef } from "react";
import { useForm } from "react-hook-form";
import { trpcClient } from "../trpc/trpc-client";
import { ConnectionSchemaInputType } from "./config/channel-provider-connection-config";

const FORM_ID = "new-connection-form";

const Header = () => (
  <Text marginBottom={2} as="h2" variant="heading">
    Channels Connections
  </Text>
);

const NoConnections = (props: { onCreate(): void }) => (
  <Box>
    <Header />
    <Text marginBottom={4} as="p">
      No channels connected yet
    </Text>
    <Box display="flex" justifyContent="flex-end">
      <Button onClick={props.onCreate}>Create first connection</Button>
    </Box>
  </Box>
);

type FormSchema = Omit<ConnectionSchemaInputType, "providerType">;

// todo edit provider form variant
const Form = (props: { onSubmit(values: FormSchema): void }) => {
  const { data: channels } = trpcClient.channelsProvidersConnection.fetchAllChannels.useQuery();
  const { data: providers } = trpcClient.providersList.fetchAllProvidersConfigurations.useQuery();

  const { handleSubmit, control } = useForm<FormSchema>({
    defaultValues: {
      channelSlug: "",
      providerId: "",
    },
  });

  // todo return flat from trpc
  const flatProviders = [...(providers?.contentful ?? [])];

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
        size="small"
        control={control}
        name="providerId"
        label="Provider"
        options={flatProviders?.map((p) => ({
          value: p.id,
          label: p.configName,
        }))}
      />
    </Box>
  );
};

const ConnectionsList = (props: { onEdit(connId: string): void }) => {
  const { data } = trpcClient.channelsProvidersConnection.fetchConnections.useQuery();
  const { data: channels } = trpcClient.channelsProvidersConnection.fetchAllChannels.useQuery();
  const { data: providers } = trpcClient.providersList.fetchAllProvidersConfigurations.useQuery();

  // todo extract to lib, getters, by id
  const providersFlatList = useMemo(() => {
    return [
      ...(providers?.contentful.map((c) => ({
        provider: c,
        type: "contentful",
      })) ?? []),
    ];
  }, [providers]);

  return (
    <Box>
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
          const provider = providersFlatList.find((p) => p.provider.id === conn.providerId);

          return (
            <React.Fragment key={conn.id}>
              <Text>{channels?.find((c) => c.slug === conn.channelSlug)?.name}</Text>
              <Text>
                <Text>{provider?.provider.configName}</Text>
                <Text color="textNeutralSubdued"> ({provider?.type})</Text>
              </Text>
              <Button onClick={() => props.onEdit(conn.id)} variant="tertiary">
                Edit
              </Button>
            </React.Fragment>
          );
        })}
      </Box>
    </Box>
  );
};

export const ChannelProviderConnectionList = () => {
  const { data, refetch } = trpcClient.channelsProvidersConnection.fetchConnections.useQuery();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const { notifySuccess } = useDashboardNotification();

  // Prefetch
  trpcClient.channelsProvidersConnection.fetchAllChannels.useQuery();
  const { data: providers } = trpcClient.providersList.fetchAllProvidersConfigurations.useQuery();

  const { mutate: addProviderMutate } =
    trpcClient.channelsProvidersConnection.addConnection.useMutation({
      onSuccess() {
        notifySuccess("Success", "Added connection");
        refetch();
        dialogRef.current?.close();
      },
    });

  const handleFormSubmit = (values: FormSchema) => {
    const providersIdType = [
      ...(providers?.contentful.map((contentful) => ({
        id: contentful.id,
        type: "contentful",
      })) ?? []),
    ];

    const providerType = providersIdType.find((p) => p.id === values.providerId)!
      .type as "contentful"; // todo

    addProviderMutate({
      ...values,
      providerType,
    });
  };

  const handleEdit = (connId: string) => {
    // todo
  };

  if (!data) {
    // todo loading and error handling
    return null;
  }

  return (
    <Box>
      <Box
        padding={6}
        borderWidth={1}
        borderRadius={4}
        borderColor="neutralHighlight"
        as="dialog"
        ref={dialogRef}
        __maxWidth="400px"
        boxShadow={"modal"}
      >
        <Text as="h2" variant="heading">
          Connect channel with Provider
        </Text>
        <Text as="p" marginBottom={6}>
          Once connected, operations on product variants on this channel will be sent to selected
          CMS platform.
        </Text>
        <Form onSubmit={handleFormSubmit} />
        <Box display="flex" gap={4} justifyContent="flex-end" marginTop={8}>
          <Button
            variant="tertiary"
            onClick={() => {
              dialogRef.current?.close();
            }}
          >
            Close
          </Button>
          <Button variant="primary" type="submit" form={FORM_ID}>
            Add connection
          </Button>
        </Box>
      </Box>
      {data.length === 0 && (
        <NoConnections
          onCreate={() => {
            dialogRef?.current?.showModal();
          }}
        />
      )}
      {data.length > 0 && <ConnectionsList onEdit={handleEdit} />}
      {data.length > 0 && (
        <Box display="flex" justifyContent="flex-end" marginTop={6}>
          <Button onClick={() => dialogRef.current?.showModal()}>Add connection</Button>
        </Box>
      )}
    </Box>
  );
};
