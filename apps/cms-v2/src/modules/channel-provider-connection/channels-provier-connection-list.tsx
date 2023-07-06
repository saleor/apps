import { useDashboardNotification } from "@saleor/apps-shared";
import { Box, Button, Text, ArrowRightIcon } from "@saleor/macaw-ui/next";
import { Select } from "@saleor/react-hook-form-macaw";
import { useRef } from "react";
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

export const ChannelProviderConnectionList = () => {
  const { data } = trpcClient.channelsProvidersConnection.fetchConnections.useQuery();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const { notifySuccess } = useDashboardNotification();

  // Prefetch
  trpcClient.channelsProvidersConnection.fetchAllChannels.useQuery();
  const { data: providers } = trpcClient.providersList.fetchAllProvidersConfigurations.useQuery();

  const { mutate: addProviderMutate } =
    trpcClient.channelsProvidersConnection.addConnection.useMutation({
      onSuccess() {
        notifySuccess("Success", "Added connection");
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

  if (!data) {
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
    </Box>
  );
};
