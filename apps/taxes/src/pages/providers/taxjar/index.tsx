import { Box, Text } from "@saleor/macaw-ui/next";
import { AppColumns } from "../../../modules/ui/app-columns";
import { CreateTaxJarConfiguration } from "../../../modules/taxjar/ui/create-taxjar-configuration";

const Header = () => {
  return (
    <Box>
      <Text as="p" variant="body">
        Connect TaxJar with Saleor{" "}
      </Text>
    </Box>
  );
};

const Intro = () => {
  return (
    <Box display="flex" flexDirection={"column"} gap={10}>
      <Text as="h2" variant="heading">
        Connect TaxJar
      </Text>
      <Text as="p" variant="body">
        {/* // todo: replace */}
        Some description text that explains how to configure the service, but also links to general
        docs and prerequisites{" "}
      </Text>
    </Box>
  );
};

const NewTaxJarPage = () => {
  return (
    <main>
      <AppColumns
        gridRatio="1/1"
        top={<Header />}
        bottomLeft={<Intro />}
        bottomRight={<CreateTaxJarConfiguration />}
      />
    </main>
  );
};

export default NewTaxJarPage;
