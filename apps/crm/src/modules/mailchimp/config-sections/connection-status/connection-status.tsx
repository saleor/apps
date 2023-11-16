import { PropsWithBox, Text } from "@saleor/macaw-ui";
import { Section } from "../../../ui/section/section";

export const ConnectionStatus = (props: PropsWithBox<{ status: "error" | "ok" }>) => (
  <Section {...props}>
    <Text variant="title" size="small" as="p" marginBottom={1.5}>
      Connection status
    </Text>
    {props.status === "ok" && <Text color="textBrandDefault">Connected</Text>}
    {props.status === "error" && (
      <Text color="textCriticalDefault">
        Error connecting to Mailchimp. Please refresh the page or reinstall the app.
      </Text>
    )}
  </Section>
);
