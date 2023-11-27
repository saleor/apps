import { Section } from "../../../ui/section/section";
import React from "react";
import { Box, Button, Chip, PropsWithBox, Text, TextProps } from "@saleor/macaw-ui";
import { useLocalStorage } from "usehooks-ts";
import { useAppBridge } from "@saleor/app-sdk/app-bridge";
import { TextLink } from "@saleor/apps-ui";

const Paragraph = (props: TextProps) => <Text marginBottom={2} as="p" {...props} />;

const Heading = (props: TextProps) => (
  <Text as="h2" variant="heading" marginBottom={1.5} marginTop={9} {...props} />
);

const getGraphiqlExampleQueryPlaygroundUrl = (apiUrl = "https://demo.saleor.io/graphql/") =>
  `https://graphiql.cloud/?endpoint=${apiUrl}#gql/N4IgjiBcILYK4BcCGCCWB7AdgAgMoFMEBZJVAGwGMALVGABwBUkBzACgBIK4BnBdGfACcAkgBFI2MQEIAlNmAAdHNjh0AJinwAFQagBumooSQbkrJdkvZUaiZx58BI0RaupMdRBOABrfAE8JBVhSShp6AH1kZm5ggBpsAzI4fCCQAG0FLJAmZmwARiz47CKclmwAJlKAXWCAX1c5RWVLIUF0QW55VytsAW5uFnwe7AblMbqQOJB0KBACYlDqWkYWEDqgA`;

export const Instructions = (props: PropsWithBox<{}>) => {
  const [instructionsVisible, setInstructionsVisible] = useLocalStorage(
    "instructions-visible",
    true,
  );

  const { appBridgeState } = useAppBridge();

  return (
    <Section {...props}>
      <Box
        cursor="pointer"
        display="flex"
        justifyContent="space-between"
        onClick={() => setInstructionsVisible((v) => !v)}
      >
        <Text as="h1" variant="title" size="small" marginBottom={9}>
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
        <Paragraph>
          Follow these guidelines to learn how to use the app. Useful resources:
        </Paragraph>
        <Paragraph>
          <TextLink href="https://docs.saleor.io/docs/3.x/category/overview" size="small">
            - Saleor Docs
          </TextLink>
        </Paragraph>
        <Paragraph>
          <TextLink
            /* TODO link to actual readme in docs*/
            href="https://github.com/saleor/apps"
            size="small"
          >
            - App Docs
          </TextLink>
        </Paragraph>
        <Paragraph>
          <TextLink href="https://github.com/saleor/apps/discussions" size="small">
            - Support
          </TextLink>
        </Paragraph>

        <Heading>Segment Tags</Heading>
        <Paragraph>
          Customer will be added to contacts list with{" "}
          <Box as="span" __display="inline-block">
            <Chip as="span">Saleor Import</Chip>
          </Box>{" "}
          tag. To create customs segments, you can use{" "}
          <TextLink href="https://docs.saleor.io/docs/3.x/developer/metadata">
            Private Metadata
          </TextLink>{" "}
          for the customer.
        </Paragraph>
        <Paragraph>
          Add{" "}
          <Text variant="bodyEmp">
            <code>mailchimp_tags</code> Private Metadata key with tags as a stringified array.
            <br />
            For example <code>mailchimp_tags: [&quot;Tag1&quot;, &quot;Tag2&quot;]</code>
          </Text>
        </Paragraph>
        <Paragraph>
          Check{" "}
          <TextLink href={getGraphiqlExampleQueryPlaygroundUrl(appBridgeState?.saleorApiUrl)}>
            example query
          </TextLink>
        </Paragraph>
      </Box>
    </Section>
  );
};
