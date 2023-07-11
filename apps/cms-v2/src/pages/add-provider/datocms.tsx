import { DatoCMSConfigForm } from "@/modules/datocms/datocms-config-form";
import { AppSection } from "@/modules/ui/app-section";
import { Breadcrumbs } from "@saleor/apps-ui";
import { Box, Text } from "@saleor/macaw-ui/next";
import { NextPage } from "next";

// todo create a single route with dynamic param and type->form mapping
const AddDatoCMSPage: NextPage = () => {
  return (
    <Box>
      <Box marginBottom={14}>
        <Breadcrumbs>
          <Breadcrumbs.Item>Saleor App CMS</Breadcrumbs.Item>
          <Breadcrumbs.Item href="/configuration">Configuration</Breadcrumbs.Item>
          <Breadcrumbs.Item href="/add-provider">Add Provider</Breadcrumbs.Item>
          <Breadcrumbs.Item>DatoCMS</Breadcrumbs.Item>
        </Breadcrumbs>
        <Text as="p" marginTop={4}>
          Connect Saleor Products to your favorite CMS platforms
        </Text>
      </Box>
      <AppSection
        heading="Set up DatoCMS"
        sideContent={
          <Box>
            <Text>Provide required information to configure DatoCMS.</Text>
          </Box>
        }
        mainContent={<DatoCMSConfigForm.AddVariant />}
      />
    </Box>
  );
};

export default AddDatoCMSPage;
