import { ContentfulConfigForm } from "@/modules/contentful/contentful-config-form";
import { ProvidersList } from "@/modules/providers-listing/providers-list";
import { trpcClient } from "@/modules/trpc/trpc-client";
import { AppSection } from "@/modules/ui/app-section";
import { Breadcrumbs } from "@saleor/apps-ui";
import { Box, Button, Text } from "@saleor/macaw-ui/next";
import { NextPage } from "next";
import { useRouter } from "next/router";

const AddContentfulPage: NextPage = () => {
  const { push } = useRouter();

  return (
    <Box>
      <Box marginBottom={14}>
        <Breadcrumbs>
          <Breadcrumbs.Item>Saleor App CMS</Breadcrumbs.Item>
          <Breadcrumbs.Item href="/configuration">Configuration</Breadcrumbs.Item>
          <Breadcrumbs.Item href="/add-provider">Add Provider</Breadcrumbs.Item>
          <Breadcrumbs.Item>Contentful</Breadcrumbs.Item>
        </Breadcrumbs>
        <Text as="p" marginTop={4}>
          Connect Saleor Products to your favorite CMS platforms
        </Text>
      </Box>
      <AppSection
        heading="Set up Contentful"
        sideContent={
          <Box>
            <Text>Provide required information to configure Contentful CMS.</Text>
          </Box>
        }
        mainContent={<ContentfulConfigForm />}
      />
    </Box>
  );
};

export default AddContentfulPage;
