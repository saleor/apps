import { Contentful } from "@/modules/contentful/contentful";
import { AppSection } from "@/modules/ui/app-section";
import { Breadcrumbs } from "@saleor/apps-ui";
import { Box, Button, Text } from "@saleor/macaw-ui/next";
import { NextPage } from "next";
import { useRouter } from "next/router";

const providers = [Contentful];

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
            {providers.map((p) => (
              <Box display="flex" alignItems="center" gap={4} key={p.type}>
                <Box __width="30px" __height="30px" __flex="0 0 30px" alignSelf={"start"}>
                  <Box width="100%" as="img" src={p.logoUrl} />
                </Box>
                <Box>
                  <Text as="h2" marginBottom={4} variant="heading">
                    {p.displayName}
                  </Text>
                  <Text>{p.description}</Text>
                </Box>
                <Button
                  variant="secondary"
                  whiteSpace="nowrap"
                  onClick={() => {
                    push(`/add-provider/${p.type}`);
                  }}
                >
                  Set up {p.displayName}
                </Button>
              </Box>
            ))}
          </Box>
        }
      />
    </Box>
  );
};

export default AddProviderPage;
