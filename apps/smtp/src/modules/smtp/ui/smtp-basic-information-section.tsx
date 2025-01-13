import { zodResolver } from "@hookform/resolvers/zod";
import { useDashboardNotification } from "@saleor/apps-shared";
import { Box, Button, Text } from "@saleor/macaw-ui";
import { Input } from "@saleor/react-hook-form-macaw";
import { useForm } from "react-hook-form";

import { BoxFooter } from "../../../components/box-footer";
import { BoxWithBorder } from "../../../components/box-with-border";
import { SectionWithDescription } from "../../../components/section-with-description";
import { defaultPadding } from "../../../components/ui-defaults";
import { setBackendErrors } from "../../../lib/set-backend-errors";
import { ConfigurationActiveDescriptionText } from "../../app-configuration/ui/configuration-active-description-text";
import { ConfigurationNameDescriptionText } from "../../app-configuration/ui/configuration-name-description-text";
import { trpcClient } from "../../trpc/trpc-client";
import {
  SmtpUpdateBasicInformation,
  smtpUpdateBasicInformationSchema,
} from "../configuration/smtp-config-input-schema";
import { SmtpConfiguration } from "../configuration/smtp-config-schema";

interface SmtpBasicInformationSectionProps {
  configuration: SmtpConfiguration;
}

export const SmtpBasicInformationSection = ({
  configuration,
}: SmtpBasicInformationSectionProps) => {
  const { notifySuccess, notifyError } = useDashboardNotification();
  const { handleSubmit, control, setError, register } = useForm<SmtpUpdateBasicInformation>({
    defaultValues: {
      id: configuration.id,
      name: configuration.name,
      active: configuration.active,
    },
    resolver: zodResolver(smtpUpdateBasicInformationSchema),
  });

  const trpcContext = trpcClient.useContext();
  const { mutate } = trpcClient.smtpConfiguration.updateBasicInformation.useMutation({
    onSuccess: async () => {
      notifySuccess("Configuration saved");
      trpcContext.smtpConfiguration.invalidate();
    },
    onError(error) {
      setBackendErrors<SmtpUpdateBasicInformation>({
        error,
        setError,
        notifyError,
      });
    },
  });

  return (
    <SectionWithDescription
      title="Status and name"
      description={
        <Box display="flex" flexDirection="column" gap={2}>
          <ConfigurationNameDescriptionText />
          <ConfigurationActiveDescriptionText />
        </Box>
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
            <Input
              name="name"
              label="Configuration name"
              control={control}
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
