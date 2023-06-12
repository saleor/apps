import { Box, Text } from "@saleor/macaw-ui/next";
import { AppColumns } from "../../../modules/ui/app-columns";
import { CreateTaxJarConfiguration } from "../../../modules/taxjar/ui/create-taxjar-configuration";
import { TaxJarInstructions } from "../../../modules/taxjar/ui/taxjar-instructions";

const Header = () => {
  return (
    <Box>
      <Text as="p" variant="body">
        Create new TaxJar configuration
      </Text>
    </Box>
  );
};

const NewTaxJarPage = () => {
  return (
    <main>
      <AppColumns top={<Header />}>
        <TaxJarInstructions />
        <CreateTaxJarConfiguration />
      </AppColumns>
    </main>
  );
};

export default NewTaxJarPage;
