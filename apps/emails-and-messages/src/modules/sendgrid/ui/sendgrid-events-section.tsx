import { SendgridConfiguration } from "../configuration/sendgrid-config-schema";
import { BoxWithBorder } from "../../../components/box-with-border";
import { Box, Button, Text, Tooltip } from "@saleor/macaw-ui/next";
import { defaultPadding } from "../../../components/ui-defaults";
import { useDashboardNotification } from "@saleor/apps-shared";
import { trpcClient } from "../../trpc/trpc-client";
import {
  SendgridUpdateEventArray,
  sendgridUpdateEventArraySchema,
} from "../configuration/sendgrid-config-input-schema";
import { useForm } from "react-hook-form";
import { BoxFooter } from "../../../components/box-footer";
import { SectionWithDescription } from "../../../components/section-with-description";
import { useQuery } from "@tanstack/react-query";
import { fetchTemplates } from "../sendgrid-api";
import { zodResolver } from "@hookform/resolvers/zod";
import { setBackendErrors } from "../../../lib/set-backend-errors";
import { Select } from "@saleor/react-hook-form-macaw";
import { TextLink } from "@saleor/apps-ui";
import { messageEventTypesLabels } from "../../event-handlers/message-event-types";
import { Table } from "../../../components/table";

interface SendgridEventsSectionProps {
  configuration: SendgridConfiguration;
}

export const SendgridEventsSection = ({ configuration }: SendgridEventsSectionProps) => {
  const { notifySuccess, notifyError } = useDashboardNotification();

  const { data: featureFlags } = trpcClient.app.featureFlags.useQuery();

  // Sort events by displayed label
  const eventsSorted = configuration.events.sort((a, b) =>
    messageEventTypesLabels[a.eventType].localeCompare(messageEventTypesLabels[b.eventType])
  );

  const { control, register, handleSubmit, setError } = useForm<SendgridUpdateEventArray>({
    defaultValues: {
      configurationId: configuration.id,
      events: eventsSorted,
    },
    resolver: zodResolver(sendgridUpdateEventArraySchema),
  });

  const trpcContext = trpcClient.useContext();
  const { mutate } = trpcClient.sendgridConfiguration.updateEventArray.useMutation({
    onSuccess: async () => {
      notifySuccess("Configuration saved");
      trpcContext.sendgridConfiguration.invalidate();
    },
    onError(error) {
      setBackendErrors<SendgridUpdateEventArray>({ error, setError, notifyError });
    },
  });

  const { data: sendgridTemplates } = useQuery({
    queryKey: ["sendgridTemplates"],
    queryFn: fetchTemplates({ apiKey: configuration.apiKey }),
    enabled: !!configuration.apiKey?.length,
  });

  const templateChoices = [{ value: "", label: "----" }, ...(sendgridTemplates || [])];

  return (
    <SectionWithDescription
      title="Events"
      description={
        <Text as="p">
          Choose which Saleor events should send emails via Sendgrid. You can create and modify your
          templates in the{" "}
          <TextLink href="https://mc.sendgrid.com/dynamic-templates" newTab={true}>
            Sendgrid dashboard
          </TextLink>
          .
        </Text>
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
                  <Table.HeaderCell>Dynamic template</Table.HeaderCell>
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
                        <Select
                          control={control}
                          name={`events.${index}.template`}
                          options={templateChoices}
                          disabled={isUnsupported}
                        />
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
