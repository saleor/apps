import { Breadcrumbs, Layout } from "@saleor/apps-ui";
import { Box, Button, Text } from "@saleor/macaw-ui";
import { NextPage } from "next";
import { useRouter } from "next/router";
import React from "react";

import { CMSProviders } from "@/modules/providers/providers-registry";
import { AppHeader } from "@/modules/ui/app-header";

const AddProviderPage: NextPage = () => {
  const { push } = useRouter();

  return (
    <Box>
      <AppHeader
        text="Connect CMS platforms to the App."
        breadcrumbs={[<Breadcrumbs.Item key="provider">Add Provider</Breadcrumbs.Item>]}
      />
      <Layout.AppSection
        heading="Select CMS provider"
        sideContent={
          <Box>
            <Text>App allows to connect one or more CMS platforms. You can add more later.</Text>
          </Box>
        }
      >
        <Layout.AppSectionCard>
          <Box
            display="grid"
            __gridTemplateColumns="auto auto auto"
            alignItems="center"
            gap={6}
            rowGap={12}
          >
            {CMSProviders.map((p) => (
              <React.Fragment key={p.type}>
                <Box __width="30px" __height="30px" __flex="0 0 30px" alignSelf={"start"}>
                  <Box width="100%" as="img" src={p.logoUrl} />
                </Box>
                <Box>
                  <Text as="h2" marginBottom={4} size={5} fontWeight="bold">
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
              </React.Fragment>
            ))}
          </Box>
        </Layout.AppSectionCard>
      </Layout.AppSection>
    </Box>
  );
};

export default AddProviderPage;
