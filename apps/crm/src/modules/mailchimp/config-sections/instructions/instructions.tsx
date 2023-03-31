import { Section } from "../../../ui/section/section";
import React from "react";
import { List, Text, TextProps, PropsWithBox, Box, Button, Chip } from "@saleor/macaw-ui/next";
import { useLocalStorage } from "usehooks-ts";
import { TextLink } from "../../../ui/text-link/text-link";

const P = (props: TextProps) => <Text marginBottom={5} as="p" {...props} />;

const H = (props: TextProps) => (
  <Text as="h2" variant="heading" marginBottom={4} marginTop={12} {...props} />
);

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
        <Text as="h1" variant="title" size="small" marginBottom={12}>
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
        <P>
          <TextLink href="https://docs.saleor.io/docs/3.x/category/overview" size="small">
            - Saleor Docs
          </TextLink>
        </P>
        <P>
          <TextLink
            /* TODO link to actual readme in docs*/
            href="https://github.com/saleor/apps"
            size="small"
          >
            - App Docs
          </TextLink>
        </P>
        <P>
          <TextLink href="https://github.com/saleor/apps/discussions" size="small">
            - Support
          </TextLink>
        </P>

        <H>Segment Tags</H>
        <P>
          Customer will be added to contacts list with{" "}
          <Box as="span" __display="inline-block">
            {/* @ts-ignore todo macaw*/}
            <Chip as="span">Saleor Import</Chip>
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
        <P>
          Check{" "}
          <TextLink href="https://demo.saleor.io/graphql/#saleor/N4IgjiBcILYK4BcCGCCWB7AdgAgMoFMEBZJVAGwGMALVGABwBUkBzACgBIK4BnBdGfACcAkgBFI2MQEIAlNmAAdHNjh0AJinwAFQagBumooSQbkrJdkvZUaiZx58BI0RaupMdRBOABrfAE8JBVhSShp6AH1kZm5ggBpsAzI4fCCQAG0FLJAmZmwARiz47CKclmwAJlKAXWCAX1c5RWVLIUF0QW55VytsAW5uFnwe7AblMbqQOJB0KBACYlDqWkYWEDqgA">
            example query
          </TextLink>
        </P>
      </Box>
    </Section>
  );
};
