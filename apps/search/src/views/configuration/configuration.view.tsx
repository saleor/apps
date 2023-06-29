import { Box, Text } from "@saleor/macaw-ui/next";
import { AppSection } from "../../components/AppSection";
import { AlgoliaConfigurationForm } from "../../components/AlgoliaConfigurationForm";
import { ImportProductsToAlgolia } from "../../components/ImportProductsToAlgolia";
import { WebhooksStatus } from "../../components/WebhooksStatus";
import { MainInstructions } from "../../components/MainInstructions";
import { WebhooksStatusInstructions } from "../../components/WebhooksStatusInstructions";
import { TextLink } from "@saleor/apps-ui";
import { useAppBridge } from "@saleor/app-sdk/app-bridge";

const ALGOLIA_DASHBOARD_TOKENS_URL = "https://www.algolia.com/account/api-keys/all";

export const ConfigurationView = () => {
  const { appBridgeState } = useAppBridge();

  return (
    <Box display="flex" flexDirection="column" gap={10}>
      <Box>
        <Text variant={"hero"} size={"medium"} as={"h1"}>
          Configuration
        </Text>
        <MainInstructions marginTop={1.5} />
      </Box>
      <AppSection
        includePadding
        heading="Webhooks status"
        sideContent={<WebhooksStatusInstructions />}
        mainContent={<WebhooksStatus />}
      />

      <AppSection
        marginTop={14}
        heading="Algolia settings"
        mainContent={<AlgoliaConfigurationForm />}
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
      />
      <AppSection
        includePadding
        marginTop={14}
        heading="Index products"
        mainContent={<ImportProductsToAlgolia />}
        sideContent={
          <Box>
            <Text>Perform initial index of all products in your Saleor database</Text>
          </Box>
        }
      />
    </Box>
  );
};
