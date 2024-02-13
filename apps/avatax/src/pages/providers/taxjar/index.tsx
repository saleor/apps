import { Box, Text } from "@saleor/macaw-ui";
import { CreateTaxJarConfiguration } from "../../../modules/taxjar/ui/create-taxjar-configuration";
import { TaxJarInstructions } from "../../../modules/taxjar/ui/taxjar-instructions";
import { AppPageLayout } from "../../../modules/ui/app-page-layout";

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
    <AppPageLayout
      top={<Header />}
      breadcrumbs={[
        {
          href: "/configuration",
          label: "Configuration",
        },
        {
          href: "/providers",
          label: "Providers",
        },
        {
          href: "/providers/taxjar",
          label: "TaxJar",
        },
      ]}
    >
      <TaxJarInstructions />
      <CreateTaxJarConfiguration />
    </AppPageLayout>
  );
};

export default NewTaxJarPage;
