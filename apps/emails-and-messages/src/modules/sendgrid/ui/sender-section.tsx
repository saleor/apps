import { SendgridConfiguration } from "../configuration/sendgrid-config-schema";
import { BoxWithBorder } from "../../../components/box-with-border";
import { Box, Button } from "@saleor/macaw-ui/next";
import { defaultPadding } from "../../../components/ui-defaults";
import { useDashboardNotification } from "@saleor/apps-shared";
import { trpcClient } from "../../trpc/trpc-client";
import {
  SendgridUpdateSender,
  sendgridUpdateSenderSchema,
} from "../configuration/sendgrid-config-input-schema";
import { useForm } from "react-hook-form";
import { BoxFooter } from "../../../components/box-footer";
import { SectionWithDescription } from "../../../components/section-with-description";
import { fetchSenders } from "../sendgrid-api";
import { useQuery } from "@tanstack/react-query";
import { zodResolver } from "@hookform/resolvers/zod";
import { Combobox } from "../../../components/react-hook-form-macaw/Combobox";

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
    resolver: zodResolver(sendgridUpdateSenderSchema),
  });

  const trpcContext = trpcClient.useContext();
  const { mutate } = trpcClient.sendgridConfiguration.updateSender.useMutation({
    onSuccess: async () => {
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
              <Combobox
                name="sender"
                control={control}
                label="Sender"
                options={sendersChoices.map((sender) => ({
                  label: sender.label,
                  value: sender.value,
                }))}
              />
            ) : (
              <Combobox name="sender" control={control} label="Sender" options={[]} />
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
