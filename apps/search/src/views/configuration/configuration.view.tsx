import { Layout, TextLink } from "@saleor/apps-ui";
import { Box, Text } from "@saleor/macaw-ui";

import { AlgoliaConfigurationForm } from "../../components/AlgoliaConfigurationForm";
import { AlgoliaFieldsSelectionForm } from "../../components/AlgoliaFieldsSelectionForm";
import { ImportProductsToAlgolia } from "../../components/ImportProductsToAlgolia";
import { IndicesSettings } from "../../components/IndicesSettings";
import { MainInstructions } from "../../components/MainInstructions";
import { WebhooksStatus } from "../../components/WebhooksStatus";
import { WebhooksStatusInstructions } from "../../components/WebhooksStatusInstructions";

const ALGOLIA_DASHBOARD_TOKENS_URL = "https://www.algolia.com/account/api-keys/all";

export const ConfigurationView = () => {
  return (
    <Box display="flex" flexDirection="column" gap={10}>
      <Box>
        <Text as={"h1"} size={10} fontWeight="bold">
          Configuration
        </Text>
        <MainInstructions marginTop={1.5} />
      </Box>
      <Layout.AppSection
        includePadding
        heading="Webhooks status"
        sideContent={<WebhooksStatusInstructions />}
      >
        <Layout.AppSectionCard>
          <WebhooksStatus />
        </Layout.AppSectionCard>
      </Layout.AppSection>

      <Layout.AppSection
        includePadding={false}
        marginTop={14}
        heading="Algolia settings"
        sideContent={
          <Box>
            <Text as="p" marginBottom={1.5}>
              Provide Algolia settings.{" "}
            </Text>
            <Text>
              You can find your tokens in Algolia Dashboard{" "}
              <TextLink href={ALGOLIA_DASHBOARD_TOKENS_URL} newTab>
                here
              </TextLink>
            </Text>
          </Box>
        }
      >
        <AlgoliaConfigurationForm />
      </Layout.AppSection>

      <Layout.AppSection
        includePadding={false}
        marginTop={14}
        heading="Algolia fields filtering"
        sideContent={
          <Box>
            <Text as="p" marginBottom={1.5}>
              Decide which fields app should send with each product variant.
            </Text>
            <Text as="p" marginBottom={1.5}>
              You should remove fields you do not need, to ensure Algolia limits will not be
              exceeded.
            </Text>
          </Box>
        }
      >
        <AlgoliaFieldsSelectionForm />
      </Layout.AppSection>

      <Layout.AppSection
        includePadding
        marginTop={14}
        heading="Index products"
        sideContent={
          <Box>
            <Text>Perform initial index of all products in your Saleor database</Text>
          </Box>
        }
      >
        <ImportProductsToAlgolia />
      </Layout.AppSection>

      <Layout.AppSection
        includePadding
        marginTop={14}
        heading="Set indices settings"
        sideContent={
          <Box>
            <Text>Sets up indices with recommended settings.</Text>
          </Box>
        }
      >
        <IndicesSettings />
      </Layout.AppSection>
    </Box>
  );
};
