import { Box, Button, Text } from "@saleor/macaw-ui";
import React from "react";
import { Layout, TextLink } from "@saleor/apps-ui";
import { useIndicesSetupMutation } from "../lib/useIndicesSetup";
import { trpcClient } from "../modules/trpc/trpc-client";

export const IndicesSettings = () => {
  const { data: algoliaConfiguration } = trpcClient.configuration.getConfig.useQuery();
  const updateWebhooksMutation = useIndicesSetupMutation();

  const isConfigured =
    algoliaConfiguration?.appConfig?.appId && algoliaConfiguration?.appConfig?.secretKey;

  return (
    <Layout.AppSectionCard
      footer={
        <Box display={"flex"} justifyContent={"flex-end"}>
          <Button
            disabled={!isConfigured}
            onClick={() => updateWebhooksMutation.mutate()}
            variant="primary"
          >
            Update indices configuration
          </Button>
        </Box>
      }
    >
      <Box>
        <Text variant={"heading"} as={"p"} marginBottom={1.5}>
          Performing this operation will update indices to use recommended settings:
        </Text>
        <ul>
          <li>
            <Text variant="body">
              Distinct and grouping. According to{" "}
              <TextLink
                href="https://www.algolia.com/doc/guides/managing-results/refine-results/faceting/"
                newTab
              >
                Algolia&apos;s recommendations
              </TextLink>
              , product variants are sent as separate entries. The distinct feature will group
              results based on product ID.
            </Text>
          </li>
          <li>
            <Text variant="body">
              Mark which attributes should be used as{" "}
              <TextLink
                href="https://www.algolia.com/doc/guides/managing-results/must-do/searchable-attributes/"
                newTab
              >
                searchable
              </TextLink>
              . This includes: name, description, category, collections.
            </Text>
          </li>
          <li>
            <Text variant="body">
              Set up attributes{" "}
              <TextLink
                href="https://www.algolia.com/doc/guides/managing-results/refine-results/faceting/"
                newTab
              >
                faceting
              </TextLink>
              . This includes: category, collections, price, product type, stock, product attributes
            </Text>
          </li>
        </ul>
        <Text variant={"heading"} as={"p"} color={"iconCriticalSubdued"} marginBottom={1.5}>
          Please note - if indices are already configured, this operation will overwrite settings
          mentioned above.
        </Text>
      </Box>
    </Layout.AppSectionCard>
  );
};
