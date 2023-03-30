import { Section } from "../../../ui/section/section";
import React from "react";
import { List, Text, TextProps, PropsWithBox, Box, Button, Chip } from "@saleor/macaw-ui/next";
import { useLocalStorage } from "../../../../lib/use-local-storage";
import { TextLink } from "../../../ui/text-link/text-link";

const P = (props: TextProps) => <Text marginBottom={4} as="p" {...props} />;

export const Instructions = (props: PropsWithBox<{}>) => {
  const [instructionsVisible, setInstructionsVisible] = useLocalStorage(
    "instructions-visible",
    true
  );

  return (
    <Section {...props}>
      <Box
        cursor="pointer"
        display="flex"
        justifyContent="space-between"
        onClick={() => setInstructionsVisible((v) => !v)}
      >
        {/* @ts-ignore todo macaw*/}
        <Text as="h1" variant="title" size="small" marginBottom={4}>
          Instructions
        </Text>
        <Button
          size="small"
          variant="tertiary"
          onClick={(e) => {
            e.stopPropagation();
            setInstructionsVisible((v) => !v);
          }}
        >
          <Text color="textNeutralSubdued">
            {instructionsVisible ? "Hide instructions" : "Show instructions"}
          </Text>
        </Button>
      </Box>
      <Box hidden={!instructionsVisible}>
        <P>Follow these guidelines to learn how to use the app. Useful resources:</P>
        <List marginBottom={8}>
          <List.Item paddingY={4} paddingX={8}>
            <TextLink href="https://docs.saleor.io/docs/3.x/category/overview" size="small">
              Saleor Docs
            </TextLink>
          </List.Item>
          <List.Item paddingY={4} paddingX={8}>
            <TextLink
              /* TODO link to actual readme in docs*/
              href="https://github.com/saleor/apps"
              size="small"
            >
              App Docs
            </TextLink>
          </List.Item>
          <List.Item paddingY={4} paddingX={8}>
            <TextLink href="https://github.com/saleor/apps/discussions" size="small">
              Support
            </TextLink>
          </List.Item>
        </List>
        {/* @ts-ignore todo macaw*/}
        <Text as="h2" variant="heading" marginY={4}>
          Segment Tags
        </Text>
        <P>
          Customer will be added to contacts list with{" "}
          <Box __display="inline-block">
            <Chip>Saleor Import</Chip>
          </Box>{" "}
          tag. To create customs segments, you can use{" "}
          <TextLink href="https://docs.saleor.io/docs/3.x/developer/metadata">
            Private Metadata
          </TextLink>{" "}
          for the customer.
        </P>
        <P>
          Add{" "}
          <Text variant="bodyEmp">
            <code>mailchimp_tags</code> Private Metadata key with tags as a stringified array.
            <br />
            For example <code>mailchimp_tags: [&quot;Tag1&quot;, &quot;Tag2&quot;]</code>
          </Text>
        </P>
      </Box>
    </Section>
  );
};
