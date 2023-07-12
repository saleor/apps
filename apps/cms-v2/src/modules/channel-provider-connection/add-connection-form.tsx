import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowRightIcon, Box } from "@saleor/macaw-ui/next";
import { Select } from "@saleor/react-hook-form-macaw";
import { useForm } from "react-hook-form";
import { ChannelProviderConnectionConfig } from "../configuration";
import { trpcClient } from "../trpc/trpc-client";

export type AddConnectionFormSchema = Omit<
  ChannelProviderConnectionConfig.InputShape,
  "providerType"
>;

export const AddConnectionFormID = "new-connection-form";

export const AddConnectionForm = (props: {
  defaultValues: AddConnectionFormSchema;
  onSubmit(values: AddConnectionFormSchema): void;
}) => {
  const { data: channels } = trpcClient.channelsProvidersConnection.fetchAllChannels.useQuery();
  const { data: providers } = trpcClient.providersConfigs.getAll.useQuery();

  const { handleSubmit, control } = useForm<AddConnectionFormSchema>({
    defaultValues: props.defaultValues,
    resolver: zodResolver(
      ChannelProviderConnectionConfig.Schema.Input.omit({ providerType: true })
    ),
  });

  return (
    <Box
      onSubmit={handleSubmit(props.onSubmit)}
      as="form"
      id={AddConnectionFormID}
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
