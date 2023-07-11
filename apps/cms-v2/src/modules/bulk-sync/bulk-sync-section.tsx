import { Box, Button, Text } from "@saleor/macaw-ui/next";
import { trpcClient } from "../trpc/trpc-client";
import { createProvider } from "../shared/cms-provider";
import { useForm } from "react-hook-form";
import { Select } from "@saleor/react-hook-form-macaw";
import { useRouter } from "next/router";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ButtonsBox } from "../ui/buttons-box";

const FormSchema = z.object({
  connID: z.string().min(7),
});

const EmptyState = () => (
  <Box
    display="flex"
    paddingY={4}
    flexDirection={"column"}
    gap={4}
    alignItems={"center"}
    justifyContent={"center"}
  >
    <Text variant="heading">No connections configured</Text>
    <Text>Create a channel connection above to enable bulk synchronization.</Text>
  </Box>
);

export const BulkSyncSection = () => {
  const { push } = useRouter();

  const { data: connections } = trpcClient.channelsProvidersConnection.fetchConnections.useQuery();
  const { data: providers } = trpcClient.providersConfigs.getAll.useQuery();

  const { control, handleSubmit } = useForm<{ connID: string }>({
    defaultValues: {
      connID: "",
    },
    resolver: zodResolver(FormSchema),
  });

  if (!connections || !providers) {
    return null; // todo loading / skeleton
  }

  if (connections.length === 0) {
    return <EmptyState />;
  }

  return (
    <Box>
      <Text as="h2" marginBottom={6} variant="heading">
        Bulk products synchronization
      </Text>
      <Text as="p">
        Choose a connection and start synchronization. Process is running in the browser.
      </Text>
      <Text as="p" variant="bodyStrong">
        Do not close the app until it is finished
      </Text>
      <Box
        display="grid"
        gap={4}
        marginTop={4}
        as="form"
        onSubmit={handleSubmit((values) => {
          push(`/bulk-sync/${values.connID}`);
        })}
      >
        <Select
          required
          control={control}
          name="connID"
          label="Connection"
          options={connections.map((c) => {
            const provider = providers.find((p) => p.id === c.providerId)!;
            const providerDisplay = createProvider(provider.type);

            return {
              label: `${c.channelSlug} -> ${provider?.configName} (${providerDisplay.displayName})`,
              value: c.id,
            };
          })}
        />
        <ButtonsBox>
          <Button type="submit">Start sync</Button>
        </ButtonsBox>
      </Box>
    </Box>
  );
};
