import { Box, Text, Chip } from "@saleor/macaw-ui/next";
import { trpcClient } from "../../trpc/trpc-client";

const defaultAddressChip = (
  <Chip __display={"inline-block"} size={"large"}>
    <Text size={"small"} color={"textNeutralSubdued"}>
      Default
    </Text>
  </Chip>
);

export const PerChannelConfigList = () => {
  const shopChannelsQuery = trpcClient.channels.fetch.useQuery();

  if (shopChannelsQuery.isLoading) {
    return <Text color={"textNeutralSubdued"}>Loading...</Text>;
  }

  return (
    <Box>
      <Box display={"grid"} gridTemplateColumns={3} marginBottom={8}>
        <Text color={"textNeutralSubdued"} variant={"caption"} size={"small"}>
          Channel
        </Text>
        <Text color={"textNeutralSubdued"} variant={"caption"} size={"small"}>
          Address
        </Text>
      </Box>
      {shopChannelsQuery.data?.map((channel) => (
        <Box
          display={"grid"}
          gridTemplateColumns={3}
          paddingY={4}
          borderBottomStyle={"solid"}
          borderBottomWidth={1}
          borderColor={"neutralHighlight"}
        >
          <Text variant={"bodyStrong"}>{channel.name}</Text>
          <Box>{defaultAddressChip}</Box>
        </Box>
      ))}
    </Box>
  );
};
