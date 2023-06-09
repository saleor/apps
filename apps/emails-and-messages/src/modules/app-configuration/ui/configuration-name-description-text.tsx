import { Text } from "@saleor/macaw-ui/next";

export const ConfigurationNameDescriptionText = () => (
  <Text as="p">
    Provide name for your configuration - you can create more than one to use different settings or
    templates depending on channel.
    <br />
    For example - <code>production</code> and <code>development</code>.
  </Text>
);
