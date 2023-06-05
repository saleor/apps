import { Box, Text } from "@saleor/macaw-ui/next";
import { EditTaxJarConfiguration } from "../../../modules/taxjar/ui/edit-taxjar-configuration";
import { AppColumns } from "../../../modules/ui/app-columns";

const Header = () => {
  return (
    <Box>
      <Text as="p" variant="body">
        Edit your TaxJar instance
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

const EditTaxJarPage = () => {
  return (
    <main>
      <AppColumns
        gridRatio="1/1"
        top={<Header />}
        bottomLeft={<Intro />}
        bottomRight={<EditTaxJarConfiguration />}
      />
    </main>
  );
};

export default EditTaxJarPage;
