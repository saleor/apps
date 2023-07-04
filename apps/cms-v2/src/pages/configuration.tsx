import { Box, Text } from "@saleor/macaw-ui/next";
import { NextPage } from "next";

const ConfigurationPage: NextPage = () => {
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
