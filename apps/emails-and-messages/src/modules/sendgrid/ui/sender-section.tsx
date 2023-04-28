import { SendgridConfiguration } from "../configuration/sendgrid-config-schema";
import { BoxWithBorder } from "../../../components/box-with-border";
import { Box, Button, Combobox } from "@saleor/macaw-ui/next";
import { defaultPadding } from "../../../components/ui-defaults";
import { useDashboardNotification } from "@saleor/apps-shared";
import { trpcClient } from "../../trpc/trpc-client";
import { SendgridUpdateSender } from "../configuration/sendgrid-config-input-schema";
import { Controller, useForm } from "react-hook-form";
import { BoxFooter } from "../../../components/box-footer";
import { SectionWithDescription } from "../../../components/section-with-description";
import { fetchSenders } from "../sendgrid-api";
import { useQuery } from "@tanstack/react-query";

interface SenderSectionProps {
  configuration: SendgridConfiguration;
}

export const SenderSection = ({ configuration }: SenderSectionProps) => {
  const { notifySuccess, notifyError } = useDashboardNotification();

  const { data: sendersChoices, isLoading: isSendersChoicesLoading } = useQuery({
    queryKey: ["sendgridSenders"],
    queryFn: fetchSenders({ apiKey: configuration.apiKey }),
    enabled: !!configuration.apiKey?.length,
  });

  const { handleSubmit, control, setError } = useForm<SendgridUpdateSender>({
    defaultValues: {
      id: configuration.id,
      sender: configuration.sender,
    },
  });

  const trpcContext = trpcClient.useContext();
  const { mutate } = trpcClient.sendgridConfiguration.updateSender.useMutation({
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
          setError(fieldName as keyof SendgridUpdateSender, {
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
    <SectionWithDescription title="Sender">
      <BoxWithBorder>
        <form
          onSubmit={handleSubmit((data, event) => {
            mutate({
              ...data,
            });
          })}
        >
          <Box padding={defaultPadding} display={"flex"} flexDirection={"column"} gap={10}>
            {sendersChoices?.length ? (
              <Controller
                name="sender"
                control={control}
                render={({
                  field: { onChange, value },
                  fieldState: { error },
                  formState: { errors },
                }) => (
                  <Combobox
                    label="Sender"
                    value={value}
                    defaultValue={configuration.sender}
                    onChange={(event) => onChange(event?.value)}
                    options={sendersChoices.map((sender) => ({
                      label: sender.label,
                      value: sender.value,
                    }))}
                    error={!!error}
                  />
                )}
              />
            ) : (
              <Combobox label="Sender" options={[]} disabled={true} />
            )}
          </Box>
          <BoxFooter>
            <Button type="submit">Save provider</Button>
          </BoxFooter>
        </form>
      </BoxWithBorder>
    </SectionWithDescription>
  );
};
