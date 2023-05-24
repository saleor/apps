import {
  SendgridConfiguration,
  SendgridEventConfiguration,
} from "../configuration/sendgrid-config-schema";
import { BoxWithBorder } from "../../../components/box-with-border";
import { Box, Button, Text } from "@saleor/macaw-ui/next";
import { defaultPadding } from "../../../components/ui-defaults";
import { useDashboardNotification } from "@saleor/apps-shared";
import { trpcClient } from "../../trpc/trpc-client";
import {
  SendgridUpdateEvent,
  sendgridUpdateEventSchema,
} from "../configuration/sendgrid-config-input-schema";
import { useForm } from "react-hook-form";
import { BoxFooter } from "../../../components/box-footer";
import { SectionWithDescription } from "../../../components/section-with-description";
import { useQuery } from "@tanstack/react-query";
import { fetchTemplates } from "../sendgrid-api";
import { zodResolver } from "@hookform/resolvers/zod";
import { setBackendErrors } from "../../../lib/set-backend-errors";
import { Combobox } from "@saleor/react-hook-form-macaw";

interface EventBoxProps {
  configuration: SendgridConfiguration;
  event: SendgridEventConfiguration;
}

const EventBox = ({ event, configuration }: EventBoxProps) => {
  const { notifySuccess, notifyError } = useDashboardNotification();

  const { data: templatesChoices } = useQuery({
    queryKey: ["sendgridTemplates"],
    queryFn: fetchTemplates({ apiKey: configuration.apiKey }),
    enabled: !!configuration.apiKey?.length,
  });

  const { handleSubmit, control, setError, register } = useForm<SendgridUpdateEvent>({
    defaultValues: {
      id: configuration.id,
      ...event,
    },
    resolver: zodResolver(sendgridUpdateEventSchema),
  });

  const trpcContext = trpcClient.useContext();
  const { mutate } = trpcClient.sendgridConfiguration.updateEvent.useMutation({
    onSuccess: async () => {
      notifySuccess("Configuration saved");
      trpcContext.sendgridConfiguration.invalidate();
    },
    onError(error) {
      setBackendErrors<SendgridUpdateEvent>({ error, setError, notifyError });
    },
  });

  return (
    <form
      onSubmit={handleSubmit((data, event) => {
        mutate({
          ...data,
        });
      })}
    >
      <BoxWithBorder>
        <Box padding={defaultPadding} display="flex" flexDirection="column" gap={defaultPadding}>
          <Text variant="heading">{event.eventType}</Text>
          {templatesChoices?.length ? (
            <Combobox
              name="template"
              control={control}
              label="Template"
              options={templatesChoices.map((sender) => ({
                label: sender.label,
                value: sender.value,
              }))}
            />
          ) : (
            <Combobox name="template" control={control} label="Template" options={[]} />
          )}

          <label>
            <input type="checkbox" placeholder="Enabled" {...register("active")} />
            <Text paddingLeft={defaultPadding}>Active</Text>
          </label>
        </Box>
        <BoxFooter>
          <Button type="submit">Save event</Button>
        </BoxFooter>
      </BoxWithBorder>
    </form>
  );
};

interface SendgridEventsSectionProps {
  configuration: SendgridConfiguration;
}

export const SendgridEventsSection = ({ configuration }: SendgridEventsSectionProps) => {
  return (
    <SectionWithDescription
      title="Events"
      description={
        <>
          <Text display="block">
            Provide unique name for your configuration - you can create more than one. For example -
            production and development.
          </Text>
          <Text display="block">Then, pass your API Key. Obtain it here.</Text>
        </>
      }
    >
      <Box display="flex" flexDirection="column" gap={defaultPadding}>
        {configuration.events.map((event) => (
          <EventBox key={event.eventType} configuration={configuration} event={event} />
        ))}
      </Box>
    </SectionWithDescription>
  );
};
