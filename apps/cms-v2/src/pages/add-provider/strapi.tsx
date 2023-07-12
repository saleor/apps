import { StrapiConfigForm } from "@/modules/strapi/strapi-config-form";
import { AppSection } from "@/modules/ui/app-section";
import { Breadcrumbs } from "@saleor/apps-ui";
import { Box, Text } from "@saleor/macaw-ui/next";
import { NextPage } from "next";

// todo unify page with dynamic params
const AddStrapiPage: NextPage = () => {
  return (
    <Box>
      <Box marginBottom={14}>
        <Breadcrumbs>
          <Breadcrumbs.Item>Saleor App CMS</Breadcrumbs.Item>
          <Breadcrumbs.Item href="/configuration">Configuration</Breadcrumbs.Item>
          <Breadcrumbs.Item href="/add-provider">Add Provider</Breadcrumbs.Item>
          <Breadcrumbs.Item>Strapi</Breadcrumbs.Item>
        </Breadcrumbs>
        <Text as="p" marginTop={4}>
          Connect Saleor Products to your favorite CMS platforms
        </Text>
      </Box>
      <AppSection
        heading="Set up Contentful"
        sideContent={
          <Box>
            <Text>Provide required information to configure Strapi CMS.</Text>
          </Box>
        }
        mainContent={<StrapiConfigForm.AddVariant />}
      />
    </Box>
  );
};

export default AddStrapiPage;
