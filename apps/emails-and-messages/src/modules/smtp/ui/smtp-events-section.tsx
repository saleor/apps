import { SmtpConfiguration } from "../configuration/smtp-config-schema";
import { BoxWithBorder } from "../../../components/box-with-border";
import { Box, Button, Text, Tooltip } from "@saleor/macaw-ui/next";
import { defaultPadding } from "../../../components/ui-defaults";
import { SectionWithDescription } from "../../../components/section-with-description";
import { useRouter } from "next/router";
import { smtpUrls } from "../urls";
import { TextLink } from "@saleor/apps-ui";
import React from "react";
import { messageEventTypesLabels } from "../../event-handlers/message-event-types";
import { BoxFooter } from "../../../components/box-footer";
import { Table } from "../../../components/table";
import { useDashboardNotification } from "@saleor/apps-shared";
import {
  SmtpUpdateEventArray,
  smtpUpdateEventArraySchema,
} from "../configuration/smtp-config-input-schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { trpcClient } from "../../trpc/trpc-client";
import { useForm } from "react-hook-form";
import { setBackendErrors } from "../../../lib/set-backend-errors";

interface SmtpEventsSectionProps {
  configuration: SmtpConfiguration;
}

export const SmtpEventsSection = ({ configuration }: SmtpEventsSectionProps) => {
  const { notifySuccess, notifyError } = useDashboardNotification();
  const router = useRouter();

  const { data: featureFlags } = trpcClient.app.featureFlags.useQuery();

  // Sort events by displayed label
  const eventsSorted = configuration.events.sort((a, b) =>
    messageEventTypesLabels[a.eventType].localeCompare(messageEventTypesLabels[b.eventType])
  );

  const { register, handleSubmit, setError } = useForm<SmtpUpdateEventArray>({
    defaultValues: {
      configurationId: configuration.id,
      events: eventsSorted,
    },
    resolver: zodResolver(smtpUpdateEventArraySchema),
  });

  const trpcContext = trpcClient.useContext();
  const { mutate } = trpcClient.smtpConfiguration.updateEventArray.useMutation({
    onSuccess: async () => {
      notifySuccess("Configuration saved");
      trpcContext.smtpConfiguration.invalidate();
    },
    onError(error) {
      setBackendErrors<SmtpUpdateEventArray>({ error, setError, notifyError });
    },
  });

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
      <form
        onSubmit={handleSubmit((data) => {
          mutate(data);
        })}
      >
        <BoxWithBorder>
          <Box padding={defaultPadding}>
            <Table.Container>
              <Table.Header>
                <Table.Row>
                  <Table.HeaderCell __width={40}>Active</Table.HeaderCell>
                  <Table.HeaderCell>Event type</Table.HeaderCell>
                  <Table.HeaderCell __width={110}></Table.HeaderCell>
                </Table.Row>
              </Table.Header>
              <Table.Body>
                {eventsSorted.map((event, index) => {
                  const isUnsupported =
                    !featureFlags?.giftCardSentEvent && event.eventType === "GIFT_CARD_SENT";

                  return (
                    <Table.Row key={event.eventType}>
                      <Table.Cell>
                        <Tooltip>
                          <Tooltip.Trigger>
                            <input
                              type="checkbox"
                              {...register(`events.${index}.active`)}
                              disabled={isUnsupported}
                            />
                          </Tooltip.Trigger>
                          {isUnsupported && (
                            <Tooltip.Content side="left">
                              Event is available in Saleor version 3.13 and above only.
                              <Tooltip.Arrow />
                            </Tooltip.Content>
                          )}
                        </Tooltip>
                      </Table.Cell>
                      <Table.Cell>
                        <Text>{messageEventTypesLabels[event.eventType]}</Text>
                      </Table.Cell>
                      <Table.Cell>
                        <Button
                          variant="tertiary"
                          size="small"
                          onClick={() => {
                            router.push(
                              smtpUrls.eventConfiguration(configuration.id, event.eventType)
                            );
                          }}
                          disabled={isUnsupported}
                        >
                          Edit template
                        </Button>
                      </Table.Cell>
                    </Table.Row>
                  );
                })}
              </Table.Body>
            </Table.Container>
          </Box>
          <BoxFooter>
            <Button type="submit">Save provider</Button>
          </BoxFooter>
        </BoxWithBorder>
      </form>
    </SectionWithDescription>
  );
};
