import { Box, Text } from "@saleor/macaw-ui";
import { Layout } from "@saleor/apps-ui";
import { WebhooksStatus } from "../../components/WebhooksStatus";
import { MainInstructions } from "../../components/MainInstructions";
import { WebhooksStatusInstructions } from "../../components/WebhooksStatusInstructions";
import { TypesenseFieldsSelectionForm } from "../../components/TypesenseFieldsSelectionForm";
import { TypesenseConfigurationForm } from "../../components/TypesenseConfigurationForm";
import { ImportProductsToTypesense } from "../../components/ImportProductToTypesense";

export const ConfigurationView = () => {
  return (
    <Box display="flex" flexDirection="column" gap={10}>
      <Box>
        <Text variant={"hero"} size={"medium"} as={"h1"}>
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
        heading="Typesense settings"
        sideContent={
          <Box>
            <Text as="p" marginBottom={1.5}>
              Provide Typesense settings.{" "}
            </Text>
          </Box>
        }
      >
        <TypesenseConfigurationForm />
      </Layout.AppSection>

      <Layout.AppSection
        includePadding={false}
        marginTop={14}
        heading="Typesense fields filtering"
        sideContent={
          <Box>
            <Text as="p" marginBottom={1.5}>
              Decide which fields app should send with each product variant.
            </Text>
            <Text as="p" marginBottom={1.5}>
              You should remove fields you do not need, to ensure Typesense limits will not be
              exceeded.
            </Text>
          </Box>
        }
      >
        <TypesenseFieldsSelectionForm />
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
        <ImportProductsToTypesense />
      </Layout.AppSection>
    </Box>
  );
};
