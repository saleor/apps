import { Box, Button, Text } from "@saleor/macaw-ui";
import { NextPage } from "next";
import { SectionWithDescription } from "../../../components/section-with-description";
import { BoxWithBorder } from "../../../components/box-with-border";
import { defaultPadding } from "../../../components/ui-defaults";
import { BoxFooter } from "../../../components/box-footer";
import { trpcClient } from "../../../modules/trpc/trpc-client";
import { useDashboardNotification } from "@saleor/apps-shared/src/use-dashboard-notification";
import { Controller, useForm } from "react-hook-form";
import { SendgridCreateConfigurationInput } from "../../../modules/sendgrid/configuration/sendgrid-config-input-schema";
import { BasicLayout } from "../../../components/basic-layout";
import { useRouter } from "next/router";
import { sendgridUrls } from "../../../modules/sendgrid/urls";
import { appUrls } from "../../../modules/app-configuration/urls";
import { setBackendErrors } from "../../../lib/set-backend-errors";
import { Input } from "@saleor/react-hook-form-macaw";
import { SendgridApiKeyDescriptionText } from "../../../modules/sendgrid/ui/sendgrid-api-key-description-text";
import { ConfigurationNameDescriptionText } from "../../../modules/app-configuration/ui/configuration-name-description-text";

const NewSendgridConfigurationPage: NextPage = () => {
  const router = useRouter();
  const { notifySuccess, notifyError } = useDashboardNotification();

  const { handleSubmit, control, setError } = useForm<SendgridCreateConfigurationInput>();

  const { mutate: createConfiguration } =
    trpcClient.sendgridConfiguration.createConfiguration.useMutation({
      onSuccess: async (data, variables) => {
        notifySuccess("Configuration saved");
        router.push(sendgridUrls.configuration(data.id));
      },
      onError(error) {
        setBackendErrors<SendgridCreateConfigurationInput>({
          error,
          setError,
          notifyError,
        });
      },
    });

  return (
    <BasicLayout
      breadcrumbs={[
        { name: "Configuration", href: appUrls.configuration() },
        { name: "Add provider" },
        { name: "SendGrid" },
      ]}
    >
      <Box display="grid" gridTemplateColumns={{ desktop: 3, mobile: 1 }}>
        <Box>
          <Text>Connect SendGrid with Saleor.</Text>
        </Box>
      </Box>
      <SectionWithDescription
        title="Connect SendGrid"
        description={
          <Box display="flex" flexDirection="column" gap={2}>
            <ConfigurationNameDescriptionText />
            <SendgridApiKeyDescriptionText />
          </Box>
        }
      >
        <BoxWithBorder>
          <form
            onSubmit={handleSubmit((data, event) => {
              createConfiguration({
                ...data,
              });
            })}
          >
            <Box padding={defaultPadding} display="flex" flexDirection="column" gap={7}>
              <Input
                name="name"
                control={control}
                label="Configuration name"
                helperText={"Name of the configuration, for example 'Production' or 'Test'"}
              />
              {/* TODO: add key validation */}
              <Input
                name="apiKey"
                control={control}
                label="API key"
                helperText={"The API key can be generated in your SendGrid dashboard"}
              />
            </Box>
            <BoxFooter>
              <Button type="submit">Save provider</Button>
            </BoxFooter>
          </form>
        </BoxWithBorder>
      </SectionWithDescription>
    </BasicLayout>
  );
};

export default NewSendgridConfigurationPage;
