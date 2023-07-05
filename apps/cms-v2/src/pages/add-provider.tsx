import { ProvidersList } from "@/modules/providers-listing/providers-list";
import { trpcClient } from "@/modules/trpc/trpc-client";
import { AppSection } from "@/modules/ui/app-section";
import { Breadcrumbs } from "@saleor/apps-ui";
import { Box, Button, Text } from "@saleor/macaw-ui/next";
import { NextPage } from "next";
import { useRouter } from "next/router";

const AddProviderPage: NextPage = () => {
  const { push } = useRouter();

  return (
    <Box>
      <Box marginBottom={14}>
        <Breadcrumbs>
          <Breadcrumbs.Item>Saleor App CMS</Breadcrumbs.Item>
          <Breadcrumbs.Item href="/configuration">Configuration</Breadcrumbs.Item>
          <Breadcrumbs.Item>Add Provider</Breadcrumbs.Item>
        </Breadcrumbs>
        <Text as="p" marginTop={4}>
          Connect Saleor Products to your favorite CMS platforms
        </Text>
      </Box>
      <AppSection
        heading="Select CMS provider"
        sideContent={
          <Box>
            <Text>App allows to connect one or more CMS platforms. You can add more later.</Text>
          </Box>
        }
        mainContent={
          <Box>
            <Box display="flex" alignItems="center" gap={4}>
              <Box>
                <Text as="h2" marginBottom={4} variant="heading">
                  Contentful
                </Text>
                <Text>
                  More than a headless CMS, Contentful is the API-first composable content platform
                  to create, manage and publish content on any digital channel.
                </Text>
              </Box>
              <Button
                variant="secondary"
                whiteSpace="nowrap"
                onClick={() => {
                  push("/add-provider/contentful");
                }}
              >
                Set up Contentful
              </Button>
            </Box>
          </Box>
        }
      />
    </Box>
  );
};

export default AddProviderPage;
