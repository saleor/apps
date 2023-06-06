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
      <AppColumns
        gridRatio="1/1"
        top={<Header />}
        bottomLeft={<TaxJarInstructions />}
        bottomRight={<EditTaxJarConfiguration />}
      />
    </main>
  );
};

export default EditTaxJarPage;
