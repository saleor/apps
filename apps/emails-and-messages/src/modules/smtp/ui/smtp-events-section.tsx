import { SmtpConfiguration } from "../configuration/smtp-config-schema";
import { BoxWithBorder } from "../../../components/box-with-border";
import { Box, Button, Text } from "@saleor/macaw-ui/next";
import { defaultPadding } from "../../../components/ui-defaults";

import { SectionWithDescription } from "../../../components/section-with-description";
import { useRouter } from "next/router";
import { smtpUrls } from "../urls";
import { TextLink } from "@saleor/apps-ui";
import React from "react";
import { messageEventTypesLabels } from "../../event-handlers/message-event-types";
import { SmtpStatusDropdownButton } from "./smtp-status-dropdown-button";
import { List } from "@saleor/macaw-ui/next";

interface SmtpEventsSectionProps {
  configuration: SmtpConfiguration;
}

export const SmtpEventsSection = ({ configuration }: SmtpEventsSectionProps) => {
  const router = useRouter();

  // Sort events by displayed label
  const eventsSorted = configuration.events.sort((a, b) =>
    messageEventTypesLabels[a.eventType].localeCompare(messageEventTypesLabels[b.eventType])
  );

  return (
    <SectionWithDescription
      title="Events"
      description={
        <Box display="flex" flexDirection="column" gap={2}>
          <Text as="p">Chose which Saleor events should send emails via SMTP.</Text>
          <Text as="p">
            You can modify the email templates using{" "}
            <TextLink href="https://mjml.io/" newTab={true}>
              MJML
            </TextLink>{" "}
            syntax.
          </Text>
        </Box>
      }
    >
      <BoxWithBorder>
        <Box
          display={"flex"}
          gap={defaultPadding}
          paddingX={defaultPadding}
          paddingTop={defaultPadding}
        >
          <Text variant="caption" color="textNeutralSubdued" __width={100}>
            Status
          </Text>
          <Text variant="caption" color="textNeutralSubdued">
            Event type
          </Text>
        </Box>
        <List display="flex" flexDirection="column">
          {eventsSorted.map((event) => (
            <List.Item
              key={event.eventType}
              display={"flex"}
              gap={defaultPadding}
              paddingX={defaultPadding}
              paddingY={2}
              cursor="auto"
            >
              <SmtpStatusDropdownButton
                configurationId={configuration.id}
                eventType={event.eventType}
                isActive={event.active}
              />
              <Text flexGrow={"1"}>{messageEventTypesLabels[event.eventType]}</Text>
              <Button
                variant="tertiary"
                size="small"
                onClick={(e) => {
                  e.stopPropagation();
                  router.push(smtpUrls.eventConfiguration(configuration.id, event.eventType));
                }}
              >
                Edit
              </Button>
            </List.Item>
          ))}
        </List>
      </BoxWithBorder>
    </SectionWithDescription>
  );
};
