import { Section } from "./sections";
import { Text } from "@saleor/macaw-ui/next";

export const NoProvidersConfigured = () => (
  <Section>
    <Text as={"p"} variant="heading">
      No providers configured
    </Text>
    <Text as={"p"}>Chose one of providers on the left and configure it to use the app</Text>
  </Section>
);
