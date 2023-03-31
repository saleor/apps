import { PropsWithBox, Text } from "@saleor/macaw-ui/next";
import { Section } from "../../../ui/section/section";

export const ConnectionStatus = (props: PropsWithBox<{ status: "error" | "ok" }>) => (
  <Section {...props}>
    {/* @ts-ignore todo macaw*/}
    <Text variant="title" size="small" as="p" marginBottom={4}>
      Connection status
    </Text>
    {props.status === "ok" && <Text color="textBrandDefault">All good</Text>}
    {props.status === "error" && (
      <Text color="textCriticalDefault">
        Error connecting to Mailchimp. Please refresh the page or reinstall the app.
      </Text>
    )}
  </Section>
);
