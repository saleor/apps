import { ContentfulEditConfigForm } from "@/modules/contentful/contentful-config-form";
import { trpcClient } from "@/modules/trpc/trpc-client";
import { AppSection } from "@/modules/ui/app-section";
import { Breadcrumbs } from "@saleor/apps-ui";
import { Box, Text } from "@saleor/macaw-ui/next";
import { NextPage } from "next";
import { useRouter } from "next/router";

const AddContentfulPage: NextPage = () => {
  const { push, query } = useRouter();
  const configId = query["configId"] as string;

  const { data } = trpcClient.contentful.fetchProviderConfiguration.useQuery(
    {
      providerId: configId,
    },
    {
      enabled: !!configId,
    }
  );

  return (
    <Box>
      <Box marginBottom={14}>
        <Breadcrumbs>
          <Breadcrumbs.Item>Saleor App CMS</Breadcrumbs.Item>
          <Breadcrumbs.Item href="/configuration">Configuration</Breadcrumbs.Item>
          <Breadcrumbs.Item>Edit Provider</Breadcrumbs.Item>
          <Breadcrumbs.Item>Contentful</Breadcrumbs.Item>
          <Breadcrumbs.Item>{data?.configName}</Breadcrumbs.Item>
        </Breadcrumbs>
        <Text as="p" marginTop={4}>
          Connect Saleor Products to your favorite CMS platforms
        </Text>
      </Box>
      <AppSection
        heading="Edit Contentful configuration"
        mainContent={<ContentfulEditConfigForm configId={configId} />}
      />
    </Box>
  );
};

export default AddContentfulPage;
