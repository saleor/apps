import { CMSProviders } from "@/modules/shared/cms-provider";
import { AppHeader } from "@/modules/ui/app-header";
import { AppSection } from "@/modules/ui/app-section";
import { Breadcrumbs } from "@saleor/apps-ui";
import { Box, Button, Text } from "@saleor/macaw-ui/next";
import { NextPage } from "next";
import { useRouter } from "next/router";
import React from "react";

const AddProviderPage: NextPage = () => {
  const { push } = useRouter();

  return (
    <Box>
      <AppHeader
        text="Connect CMS platforms to the App."
        breadcrumbs={[<Breadcrumbs.Item key="provider">Add Provider</Breadcrumbs.Item>]}
      />
      <AppSection
        heading="Select CMS provider"
        sideContent={
          <Box>
            <Text>App allows to connect one or more CMS platforms. You can add more later.</Text>
          </Box>
        }
        mainContent={
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
              </React.Fragment>
            ))}
          </Box>
        }
      />
    </Box>
  );
};

export default AddProviderPage;
