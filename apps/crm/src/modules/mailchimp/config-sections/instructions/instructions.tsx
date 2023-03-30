import { Section } from "../../../ui/section/section";
import React from "react";
import { List, Text, TextProps, PropsWithBox, Box, Button } from "@saleor/macaw-ui/next";
import { useLocalStorage } from "../../../../lib/use-local-storage";

const P = (props: TextProps) => <Text marginBottom={4} as="p" {...props} />;

export const Instructions = (props: PropsWithBox<{}>) => {
  const [instructionsVisible, setInstructionsVisible] = useLocalStorage(
    "instructions-visible",
    true
  );

  return (
    <Section {...props}>
      <Box display="flex" justifyContent="space-between">
        {/* @ts-ignore todo macaw*/}
        <Text as="h1" variant="title" size="small" marginBottom={4}>
          Instructions
        </Text>
        <Button size="small" variant="tertiary" onClick={() => setInstructionsVisible((v) => !v)}>
          <Text color="textNeutralSubdued">
            {instructionsVisible ? "Hide instructions" : "Show instructions"}
          </Text>
        </Button>
      </Box>
      <Box hidden={!instructionsVisible}>
        <P>Follow these guidelines to learn how to use the app. Useful resources:</P>
        <List marginBottom={8}>
          <List.Item paddingY={4} paddingX={8}>
            Saleor Docs
          </List.Item>
          <List.Item paddingY={4} paddingX={8}>
            App Docs
          </List.Item>
          <List.Item paddingY={4} paddingX={8}>
            Support
          </List.Item>
        </List>
        {/* @ts-ignore todo macaw*/}
        <Text as="h2" variant="heading" marginY={4}>
          Segment Tags
        </Text>
        <P>
          Customer will be added to contacts list with{" "}
          <Text variant="bodyStrong">Saleor Import</Text> tag. To create customs segments, you can
          use Private Metadata for the customer.
        </P>
        <P>
          Add{" "}
          <Text variant="bodyEmp">
            <code>mailchimp_tags</code> Private Metadata key with tags in stringified array.
            <br />
            For example <code>mailchimp_tags: [&quot;Tag1&quot;, &quot;Tag2&quot;]</code>
          </Text>
        </P>
      </Box>
    </Section>
  );
};
