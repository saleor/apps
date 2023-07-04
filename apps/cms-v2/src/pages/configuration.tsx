import { trpcClient } from "@/modules/trpc/trpc-client";
import { Box, Text } from "@saleor/macaw-ui/next";
import { NextPage } from "next";

const ConfigurationPage: NextPage = () => {
  const a = trpcClient.foo.get.useQuery();

  // todo temp
  console.log(a.data);

  return (
    <Box>
      <Text variant="hero">Saleor App CMS</Text>
      <Text as="p" marginTop={4}>
        Connect Saleor Products to your favorite CMS platforms
      </Text>
    </Box>
  );
};

export default ConfigurationPage;
