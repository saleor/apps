import { SendgridConfiguration } from "../configuration/sendgrid-config-schema";
import { BoxWithBorder } from "../../../components/box-with-border";
import { Box, Button, Text } from "@saleor/macaw-ui/next";
import { defaultPadding } from "../../../components/ui-defaults";
import { useDashboardNotification } from "@saleor/apps-shared";
import { trpcClient } from "../../trpc/trpc-client";
import {
  SendgridUpdateBasicInformation,
  sendgridUpdateBasicInformationSchema,
} from "../configuration/sendgrid-config-input-schema";
import { useForm } from "react-hook-form";
import { BoxFooter } from "../../../components/box-footer";
import { SectionWithDescription } from "../../../components/section-with-description";
import { zodResolver } from "@hookform/resolvers/zod";
import { setBackendErrors } from "../../../lib/set-backend-errors";
import { Input } from "@saleor/react-hook-form-macaw";

interface SendgridBasicInformationSectionProps {
  configuration: SendgridConfiguration;
}

export const SendgridBasicInformationSection = ({
  configuration,
}: SendgridBasicInformationSectionProps) => {
  const { notifySuccess, notifyError } = useDashboardNotification();
  const { handleSubmit, control, setError, register } = useForm<SendgridUpdateBasicInformation>({
    defaultValues: {
      id: configuration.id,
      name: configuration.name,
      active: configuration.active,
    },
    resolver: zodResolver(sendgridUpdateBasicInformationSchema),
  });

  const trpcContext = trpcClient.useContext();
  const { mutate } = trpcClient.sendgridConfiguration.updateBasicInformation.useMutation({
    onSuccess: async () => {
      notifySuccess("Configuration saved");
      trpcContext.sendgridConfiguration.invalidate();
    },
    onError(error) {
      setBackendErrors<SendgridUpdateBasicInformation>({
        error,
        setError,
        notifyError,
      });
    },
  });

  return (
    <SectionWithDescription
      title="Connect Sendgrid"
      description={
        <Text>
          Provide unique name for your configuration - you can create more than one. For example -
          production and development. Then, pass your API Key. Obtain it here.
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
          <Box padding={defaultPadding} display="flex" flexDirection="column" gap={10}>
            <Input
              label="Configuration name"
              control={control}
              name="name"
              helperText="Name of the configuration, for example 'Production' or 'Test'"
            />
            <label>
              <input type="checkbox" placeholder="Enabled" {...register("active")} />
              <Text paddingLeft={defaultPadding}>Active</Text>
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
