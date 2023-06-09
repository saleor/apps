import { TextLink } from "@saleor/apps-ui";
import { Box, PropsWithBox, Text } from "@saleor/macaw-ui/next";

const SALEOR_EVENTS_DOCS_URL =
  "https://docs.saleor.io/docs/3.x/developer/extending/apps/asynchronous-webhooks#available-webhook-events";

export const MainInstructions = ({ children, ...props }: PropsWithBox<{}>) => {
  return (
    <Box {...props}>
      <Text as="p" marginBottom={1.5}>
        To configure the App, fill in your Algolia settings to enable products indexing.
      </Text>
      <Text as="p" marginBottom={1.5}>
        Once the App is configured, you will be able to perform initial index of your existing
        Saleor database.
      </Text>
      <Text as="p">
        The app supports following{" "}
        <TextLink href={SALEOR_EVENTS_DOCS_URL} newTab>
          events
        </TextLink>{" "}
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
  );
};
