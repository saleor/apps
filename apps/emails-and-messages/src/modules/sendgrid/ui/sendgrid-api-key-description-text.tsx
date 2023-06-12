import { TextLink } from "@saleor/apps-ui";
import { Text } from "@saleor/macaw-ui/next";

export const SendgridApiKeyDescriptionText = () => (
  <Text as="p">
    The API keys can be found at your Sendgrid dashboard, in the Settings menu. You can find more
    information in the{" "}
    <TextLink href="https://docs.sendgrid.com/ui/account-and-settings/api-keys" newTab={true}>
      documentation
    </TextLink>
    .
  </Text>
);
