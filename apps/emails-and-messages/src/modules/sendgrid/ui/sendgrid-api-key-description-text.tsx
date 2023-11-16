import { TextLink } from "@saleor/apps-ui";
import { Text } from "@saleor/macaw-ui";

export const SendgridApiKeyDescriptionText = () => (
  <Text as="p">
    The API keys can be found at your SendGrid dashboard, in the Settings menu. You can find more
    information in the{" "}
    <TextLink href="https://docs.sendgrid.com/ui/account-and-settings/api-keys" newTab={true}>
      documentation
    </TextLink>
    .
  </Text>
);
