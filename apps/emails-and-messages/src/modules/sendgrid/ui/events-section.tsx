import {
  SendgridConfiguration,
  SendgridEventConfiguration,
} from "../configuration/sendgrid-config-schema";
import { BoxWithBorder } from "../../../components/box-with-border";
import { Box, Button, Combobox, Text } from "@saleor/macaw-ui/next";
import { defaultPadding } from "../../../components/ui-defaults";
import { useDashboardNotification } from "@saleor/apps-shared";
import { trpcClient } from "../../trpc/trpc-client";
import { SendgridUpdateEvent } from "../configuration/sendgrid-config-input-schema";
import { Controller, useForm } from "react-hook-form";
import { BoxFooter } from "../../../components/box-footer";
import { SectionWithDescription } from "../../../components/section-with-description";
import { useQuery } from "@tanstack/react-query";
import { fetchTemplates } from "../sendgrid-api";

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
  });

  const trpcContext = trpcClient.useContext();
  const { mutate } = trpcClient.sendgridConfiguration.updateEvent.useMutation({
    onSuccess: async (data, variables) => {
      notifySuccess("Configuration saved");
      trpcContext.sendgridConfiguration.invalidate();
    },
    onError(error) {
      let isFieldErrorSet = false;
      const fieldErrors = error.data?.zodError?.fieldErrors || {};
      for (const fieldName in fieldErrors) {
        for (const message of fieldErrors[fieldName] || []) {
          isFieldErrorSet = true;
          setError(fieldName as keyof SendgridUpdateEvent, {
            type: "manual",
            message,
          });
        }
      }
      const formErrors = error.data?.zodError?.formErrors || [];
      const formErrorMessage = formErrors.length ? formErrors.join("\n") : undefined;

      notifyError(
        "Could not save the configuration",
        isFieldErrorSet ? "Submitted form contain errors" : "Error saving configuration",
        formErrorMessage
      );
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
        <Box
          padding={defaultPadding}
          display={"flex"}
          flexDirection={"column"}
          gap={defaultPadding}
        >
          <Text variant="heading">{event.eventType}</Text>
          {!templatesChoices ? (
            <Combobox label="Template" disabled options={[]} />
          ) : (
            <Controller
              name="template"
              control={control}
              render={({
                field: { onChange, value },
                fieldState: { error },
                formState: { errors },
              }) => (
                <Combobox
                  label="Template"
                  value={value}
                  onChange={(event) => onChange(event?.value)}
                  options={templatesChoices.map((sender) => ({
                    label: sender.label,
                    value: sender.value,
                  }))}
                  error={!!error}
                />
              )}
            />
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

interface EventsSectionProps {
  configuration: SendgridConfiguration;
}

export const EventsSection = ({ configuration }: EventsSectionProps) => {
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
      <Box display="flex" flexDirection={"column"} gap={defaultPadding}>
        {configuration.events.map((event) => (
          <EventBox key={event.eventType} configuration={configuration} event={event} />
        ))}
      </Box>
    </SectionWithDescription>
  );
};
