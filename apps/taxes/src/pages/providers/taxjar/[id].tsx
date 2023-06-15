import { Box, Text } from "@saleor/macaw-ui/next";
import { EditTaxJarConfiguration } from "../../../modules/taxjar/ui/edit-taxjar-configuration";
import { AppColumns } from "../../../modules/ui/app-columns";
import { TaxJarInstructions } from "../../../modules/taxjar/ui/taxjar-instructions";

const Header = () => {
  return (
    <Box>
      <Text as="p" variant="body">
        Edit your existing TaxJar configuration
      </Text>
    </Box>
  );
};

const EditTaxJarPage = () => {
  return (
    <main>
      <AppColumns top={<Header />}>
        <TaxJarInstructions />
        <EditTaxJarConfiguration />
      </AppColumns>
    </main>
  );
};

export default EditTaxJarPage;
