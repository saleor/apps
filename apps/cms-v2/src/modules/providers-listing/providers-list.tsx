import { Box, Text, Button } from "@saleor/macaw-ui/next";
import { useRouter } from "next/router";
import React from "react";
import { trpcClient } from "../trpc/trpc-client";

export const ProvidersList = () => {
  const { data } = trpcClient.providersList.fetchAllProvidersConfigurations.useQuery();
  const { push } = useRouter();

  if (!data) {
    return null;
  }

  if (data.totalProvidersLength === 0) {
    return (
      <Box>
        <Text as="p" marginBottom={4}>
          No configurations yet
        </Text>
        <Button
          onClick={() => {
            push("/add-provider");
          }}
        >
          Add first CMS configuration
        </Button>
      </Box>
    );
  }

  // todo consider some better, reusable table
  return (
    <Box>
      {data.contentful.length && (
        <Box>
          <Text variant="heading" as="h2" marginBottom={4}>
            Contentful
          </Text>
          <Box display="grid" __gridTemplateColumns="repeat(4, auto)" gap={4} alignItems="center">
            <Text variant="caption">Config name</Text>
            <Text variant="caption">Contenful space ID</Text>
            <Text variant="caption">Contentful content ID</Text>
            <div />

            {data.contentful.map((contentfulProvider) => (
              <React.Fragment key={contentfulProvider.id}>
                <Text>{contentfulProvider.configName}</Text>
                <Text>{contentfulProvider.spaceId}</Text>
                <Text>{contentfulProvider.contentId}</Text>
                <Button
                  marginLeft="auto"
                  variant="tertiary"
                  onClick={() => {
                    push("/edit-provider/contentful/" + contentfulProvider.id);
                  }}
                >
                  Edit
                </Button>
              </React.Fragment>
            ))}
          </Box>
        </Box>
      )}
      <Box marginTop={8} display="flex" justifyContent="flex-end">
        <Button
          onClick={() => {
            push("/add-provider");
          }}
        >
          Add CMS configuration
        </Button>
      </Box>
    </Box>
  );
};
