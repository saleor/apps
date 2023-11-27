import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowRightIcon, Box, Text } from "@saleor/macaw-ui";
import { Select } from "@saleor/react-hook-form-macaw";
import { useForm } from "react-hook-form";
import { ChannelProviderConnectionConfig } from "../configuration";
import { trpcClient } from "../trpc/trpc-client";
import { TRPCError } from "@trpc/server";

export type AddConnectionFormSchema = Omit<
  ChannelProviderConnectionConfig.InputShape,
  "providerType"
>;

export const AddConnectionFormID = "new-connection-form";

export const AddConnectionForm = (props: {
  defaultValues: AddConnectionFormSchema;
  onSubmit(values: AddConnectionFormSchema): Promise<void>;
}) => {
  const { data: channels } = trpcClient.channelsProvidersConnection.fetchAllChannels.useQuery();
  const { data: providers } = trpcClient.providersConfigs.getAll.useQuery();

  const {
    handleSubmit,
    control,
    setError,
    formState: { errors },
  } = useForm({
    defaultValues: props.defaultValues,
    resolver: zodResolver(
      ChannelProviderConnectionConfig.Schema.Input.omit({ providerType: true })
    ),
  });

  const onSubmit = (values: AddConnectionFormSchema) => {
    props.onSubmit(values).catch((err: TRPCError) => {
      setError("channelSlug", {
        type: "manual",
      });
      setError("providerId", {
        type: "manual",
      });

      setError("root.serverError", {
        type: "manual",
        message: err.message,
      });
    });
  };

  return (
    <Box onSubmit={handleSubmit(onSubmit)} as="form" id={AddConnectionFormID}>
      <Box display="grid" __gridTemplateColumns="1fr auto 1fr" gap={4} alignItems="center">
        <Select
          required
          size="small"
          control={control}
          name="channelSlug"
          label="Channel"
          options={
            channels?.map((c) => ({
              value: c.slug,
              label: c.name,
            })) ?? []
          }
        />
        <ArrowRightIcon />
        <Select
          required
          size="small"
          control={control}
          name="providerId"
          label="Provider"
          options={
            providers?.map((p) => ({
              value: p.id,
              label: p.configName,
            })) ?? []
          }
        />
      </Box>
      {errors.root?.serverError && (
        <Text as="p" marginTop={2} color="textCriticalSubdued">
          {errors.root?.serverError.message}
        </Text>
      )}
    </Box>
  );
};
