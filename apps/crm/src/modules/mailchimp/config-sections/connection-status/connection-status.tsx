import { PropsWithBox, Text } from "@saleor/macaw-ui/next";
import { Section } from "../../../ui/section/section";

/**
 * TODO Add other statuses
 */
export const ConnectionStatus = (props: PropsWithBox<{}>) => (
  <Section {...props}>
    {/* @ts-ignore todo macaw*/}
    <Text variant="title" size="small" as="p" marginBottom={4}>
      Connection status
    </Text>
    <Text color="textBrandDefault">All good</Text>
  </Section>
);
