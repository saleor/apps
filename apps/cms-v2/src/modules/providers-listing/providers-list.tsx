import { Box, Text, Button } from "@saleor/macaw-ui/next";
import { useRouter } from "next/router";
import { trpcClient } from "../trpc/trpc-client";

export const ProvidersList = () => {
  const { data } = trpcClient.providersList.fetchAllProvidersConfigurations.useQuery();
  const { push } = useRouter();

  if (!data) {
    return null;
  }

  if (data.length === 0) {
    return (
      <Box>
        <Text as="p" marginBottom={4}>
          No configurations yet
        </Text>
        <Button
          onClick={() => {
            push("/add-provider");
          }}
        >
          Add first CMS configuration
        </Button>
      </Box>
    );
  }

  return (
    <Box>
      {data.map((config) => (
        <Box>todo</Box>
      ))}
    </Box>
  );
};
