import { SmtpConfiguration, SmtpEventConfiguration } from "../configuration/smtp-config-schema";
import { BoxWithBorder } from "../../../components/box-with-border";
import { Box, Button, Text } from "@saleor/macaw-ui/next";
import { defaultPadding } from "../../../components/ui-defaults";
import { useDashboardNotification } from "@saleor/apps-shared";
import { trpcClient } from "../../trpc/trpc-client";
import { useForm } from "react-hook-form";
import { BoxFooter } from "../../../components/box-footer";
import { SectionWithDescription } from "../../../components/section-with-description";
import { SmtpUpdateEvent, smtpUpdateEventSchema } from "../configuration/smtp-config-input-schema";
import { useRouter } from "next/router";
import { zodResolver } from "@hookform/resolvers/zod";
import { smtpUrls } from "../urls";
import { setBackendErrors } from "../../../lib/set-backend-errors";

interface EventBoxProps {
  configuration: SmtpConfiguration;
  event: SmtpEventConfiguration;
}

const EventBox = ({ event, configuration }: EventBoxProps) => {
  const router = useRouter();
  const { notifySuccess, notifyError } = useDashboardNotification();

  const { handleSubmit, control, setError, register } = useForm<SmtpUpdateEvent>({
    defaultValues: {
      id: configuration.id,
      ...event,
    },
    resolver: zodResolver(smtpUpdateEventSchema),
  });

  const trpcContext = trpcClient.useContext();
  const { mutate } = trpcClient.smtpConfiguration.updateEvent.useMutation({
    onSuccess: async () => {
      notifySuccess("Configuration saved");
      trpcContext.smtpConfiguration.invalidate();
    },
    onError(error) {
      setBackendErrors<SmtpUpdateEvent>({
        error,
        setError,
        notifyError,
      });
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
          <Button
            variant="secondary"
            onClick={() => {
              router.push(smtpUrls.eventConfiguration(configuration.id, event.eventType));
            }}
          >
            Edit template
          </Button>

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

interface SmtpEventsSectionProps {
  configuration: SmtpConfiguration;
}

export const SmtpEventsSection = ({ configuration }: SmtpEventsSectionProps) => {
  return (
    <SectionWithDescription
      title="Events"
      description={
        <Text as="p">
          Choose which events should trigger sending emails to your customers. You can customize
          each email template.
        </Text>
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
