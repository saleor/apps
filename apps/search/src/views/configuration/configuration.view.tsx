import { Box, Text } from "@saleor/macaw-ui/next";
import { AppSection } from "../../components/AppSection";
import { AlgoliaConfigurationForm } from "../../components/AlgoliaConfigurationForm";
import { ImportProductsToAlgolia } from "../../components/ImportProductsToAlgolia";
import { actions, useAppBridge } from "@saleor/app-sdk/app-bridge";
import { WebhooksStatus } from "../../components/WebhooksStatus";

const SALEOR_EVENTS_DOCS_URL =
  "https://docs.saleor.io/docs/3.x/developer/extending/apps/asynchronous-webhooks#available-webhook-events";

const ALGOLIA_DASHBOARD_TOKENS_URL = "https://www.algolia.com/account/api-keys/all";

export const ConfigurationView = () => {
  const { appBridge } = useAppBridge();

  return (
    <Box>
      <Text variant={"hero"} size={"medium"} as={"h1"}>
        Configuration
      </Text>
      <Box marginTop={4} __marginBottom={"100px"}>
        <Text as="p" marginBottom={4}>
          To configure the App, fill in your Algolia settings to enable products indexing.
        </Text>
        <Text as="p" marginBottom={4}>
          Once the App is configured, you will be able to perform initial index of your existing
          Saleor database.
        </Text>
        <Text as="p">
          The app supports following{" "}
          <a
            onClick={(e) => {
              e.preventDefault();

              /**
               * TODO extract shared handler
               */
              appBridge?.dispatch(
                actions.Redirect({
                  to: SALEOR_EVENTS_DOCS_URL,
                  newContext: true,
                })
              );
            }}
            href={SALEOR_EVENTS_DOCS_URL}
          >
            events
          </a>{" "}
          that will synchronize Algolia in the background:
        </Text>
        <ul>
          <li>
            <code>- PRODUCT_CREATED</code>
          </li>
          <li>
            <code>- PRODUCT_UPDATED</code>
          </li>
          <li>
            <code>- PRODUCT_DELETED</code>
          </li>
          <li>
            <code>- PRODUCT_VARIANT_CREATED</code>
          </li>
          <li>
            <code>- PRODUCT_VARIANT_UPDATED</code>
          </li>
          <li>
            <code>- PRODUCT_VARIANT_DELETED</code>
          </li>
        </ul>
      </Box>

      <AppSection
        includePadding
        heading="Webhooks status"
        sideContent={
          <Text>
            Check status of registered webhooks. If they fail, please revisit configuration
          </Text>
        }
        mainContent={<WebhooksStatus />}
      />

      <AppSection
        marginTop={13}
        heading="Algolia settings"
        mainContent={<AlgoliaConfigurationForm />}
        sideContent={
          <Box>
            <Text as="p" marginBottom={4}>
              Provide Algolia settings.{" "}
            </Text>
            <Text>
              You can find your tokens in Algolia Dashboard{" "}
              <a
                href={ALGOLIA_DASHBOARD_TOKENS_URL}
                onClick={(e) => {
                  e.preventDefault();

                  appBridge?.dispatch(
                    actions.Redirect({
                      to: ALGOLIA_DASHBOARD_TOKENS_URL,
                      newContext: true,
                    })
                  );
                }}
              >
                here
              </a>
            </Text>
          </Box>
        }
      />
      <AppSection
        includePadding
        marginTop={13}
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
