import { SendgridConfiguration } from "../configuration/sendgrid-config-schema";
import { BoxWithBorder } from "../../../components/box-with-border";
import { Box, Button, Text } from "@saleor/macaw-ui";
import { defaultPadding } from "../../../components/ui-defaults";
import { useDashboardNotification } from "@saleor/apps-shared";
import { trpcClient } from "../../trpc/trpc-client";
import {
  SendgridUpdateApiConnection,
  sendgridUpdateApiConnectionSchema,
} from "../configuration/sendgrid-config-input-schema";
import { useForm } from "react-hook-form";
import { BoxFooter } from "../../../components/box-footer";
import { SectionWithDescription } from "../../../components/section-with-description";
import { zodResolver } from "@hookform/resolvers/zod";
import { setBackendErrors } from "../../../lib/set-backend-errors";
import { Input } from "@saleor/react-hook-form-macaw";
import { SendgridApiKeyDescriptionText } from "./sendgrid-api-key-description-text";

interface ApiConnectionSectionProps {
  configuration: SendgridConfiguration;
}

export const ApiConnectionSection = ({ configuration }: ApiConnectionSectionProps) => {
  const { notifySuccess, notifyError } = useDashboardNotification();

  const { handleSubmit, control, setError, register } = useForm<SendgridUpdateApiConnection>({
    defaultValues: {
      id: configuration.id,
      apiKey: configuration.apiKey,
      sandboxMode: configuration.sandboxMode,
    },
    resolver: zodResolver(sendgridUpdateApiConnectionSchema),
  });

  const trpcContext = trpcClient.useContext();
  const { mutate } = trpcClient.sendgridConfiguration.updateApiConnection.useMutation({
    onSuccess: async (data, variables) => {
      notifySuccess("Configuration saved");
      trpcContext.sendgridConfiguration.invalidate();
    },
    onError(error) {
      setBackendErrors<SendgridUpdateApiConnection>({
        error,
        setError,
        notifyError,
      });
    },
  });

  return (
    <SectionWithDescription title="API Connection" description={<SendgridApiKeyDescriptionText />}>
      <BoxWithBorder>
        <form
          onSubmit={handleSubmit((data, event) => {
            mutate({
              ...data,
            });
          })}
        >
          <Box padding={defaultPadding} display="flex" flexDirection="column" gap={7}>
            <Input
              label="API Key"
              name="apiKey"
              control={control}
              helperText="The API key can be generated in your SendGrid dashboard"
            />

            <label>
              <input type="checkbox" {...register("sandboxMode")} />
              <Text paddingLeft={defaultPadding}>Sandbox mode</Text>
            </label>
          </Box>
          <BoxFooter>
            <Button type="submit">Save provider</Button>
          </BoxFooter>
        </form>
      </BoxWithBorder>
    </SectionWithDescription>
  );
};
