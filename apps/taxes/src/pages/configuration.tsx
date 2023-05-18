import { Box, Text } from "@saleor/macaw-ui/next";
import { AppColumns } from "../modules/ui/app-columns";
import { Providers } from "../modules/ui/providers";

const Header = () => {
  return (
    <Box>
      <Text as="p" variant="body" __fontWeight={"400"}>
        Please configure the app by connecting one of the supported tax providers.
      </Text>
    </Box>
  );
};

const Intro = () => {
  return (
    <Box display="flex" flexDirection={"column"} gap={10}>
      <Text as="h2" variant="heading">
        Tax providers
      </Text>
      <Text as="p" variant="body" __fontWeight={"400"}>
        Manage providers configuration to connect Saleor with providers.
      </Text>
    </Box>
  );
};

const ConfigurationPage = () => {
  return (
    <main>
      <AppColumns top={<Header />} bottomLeft={<Intro />} bottomRight={<Providers />} />
    </main>
  );
};

export default ConfigurationPage;
