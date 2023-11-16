import { SendgridConfiguration } from "../configuration/sendgrid-config-schema";
import { BoxWithBorder } from "../../../components/box-with-border";
import { Box, Button, Text } from "@saleor/macaw-ui";
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
import { setBackendErrors } from "../../../lib/set-backend-errors";
import { Combobox } from "@saleor/react-hook-form-macaw";
import { TextLink } from "@saleor/apps-ui";

interface SendgridSenderSectionProps {
  configuration: SendgridConfiguration;
}

export const SendgridSenderSection = ({ configuration }: SendgridSenderSectionProps) => {
  const { notifySuccess, notifyError } = useDashboardNotification();

  const { data: sendersChoices } = useQuery({
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
      setBackendErrors<SendgridUpdateSender>({ error, setError, notifyError });
    },
  });

  return (
    <SectionWithDescription
      title="Sender"
      description={
        <Text as="p">
          Authenticating the sender is required to send emails. Configure your sender in{" "}
          <TextLink href="https://app.sendgrid.com/settings/sender_auth" newTab={true}>
            SendGrid dashboard
          </TextLink>{" "}
          and choose it from the list.
        </Text>
      }
    >
      <BoxWithBorder>
        <form
          onSubmit={handleSubmit((data, event) => {
            mutate({
              ...data,
            });
          })}
        >
          <Box padding={defaultPadding} display="flex" flexDirection="column" gap={7}>
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
