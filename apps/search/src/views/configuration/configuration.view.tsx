import { Box, Text } from "@saleor/macaw-ui/next";
import { AppSection } from "../../components/AppSection";
import { AlgoliaConfigurationForm } from "../../components/AlgoliaConfigurationForm";
import { ImportProductsToAlgolia } from "../../components/ImportProductsToAlgolia";

export const ConfigurationView = () => {
  return (
    <Box>
      <Text variant={"hero"} size={"medium"} as={"h1"}>
        Configuration
      </Text>
      <Text as="p" marginTop={4} __marginBottom={"100px"}>
        Configure the App - fill your Algolia settings to allow products indexing
      </Text>
      <AppSection
        heading="Algolia settings"
        mainContent={<AlgoliaConfigurationForm />}
        sideContent={<Text>Provide Algolia settings. </Text>}
      />
      <AppSection
        includePadding
        marginTop={13}
        heading="Index products"
        mainContent={<ImportProductsToAlgolia />}
        sideContent={
          <Box>
            <Text>Perform initial index of all products in your Saleor database</Text>
          </Box>
        }
      />
    </Box>
  );
};
