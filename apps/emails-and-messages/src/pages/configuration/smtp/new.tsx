import { Box, Button, Divider, Text } from "@saleor/macaw-ui/next";
import { NextPage } from "next";
import { SectionWithDescription } from "../../../components/section-with-description";
import { BoxWithBorder } from "../../../components/box-with-border";
import { defaultPadding } from "../../../components/ui-defaults";
import { BoxFooter } from "../../../components/box-footer";
import { trpcClient } from "../../../modules/trpc/trpc-client";
import { useDashboardNotification } from "@saleor/apps-shared/src/use-dashboard-notification";
import { useForm } from "react-hook-form";
import {
  SmtpCreateConfigurationInput,
  smtpCreateConfigurationInputSchema,
} from "../../../modules/smtp/configuration/smtp-config-input-schema";
import { BasicLayout } from "../../../components/basic-layout";
import { useRouter } from "next/router";
import { zodResolver } from "@hookform/resolvers/zod";
import { appUrls } from "../../../modules/app-configuration/urls";
import { smtpUrls } from "../../../modules/smtp/urls";
import { setBackendErrors } from "../../../lib/set-backend-errors";
import { Input } from "@saleor/react-hook-form-macaw";

const NewSmtpConfigurationPage: NextPage = () => {
  const router = useRouter();
  const { notifySuccess, notifyError } = useDashboardNotification();

  const { handleSubmit, control, setError, register } = useForm<SmtpCreateConfigurationInput>({
    defaultValues: { encryption: "NONE" },
    resolver: zodResolver(smtpCreateConfigurationInputSchema),
  });

  const { mutate } = trpcClient.smtpConfiguration.createConfiguration.useMutation({
    onSuccess: async (data, variables) => {
      notifySuccess("Configuration saved");
      router.push(smtpUrls.configuration(data.id));
    },
    onError(error) {
      setBackendErrors<SmtpCreateConfigurationInput>({
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
        { name: "SMTP" },
      ]}
    >
      <Box display="grid" gridTemplateColumns={{ desktop: 3, mobile: 1 }}>
        <Box>
          <Text>Connect SMTP with Saleor.</Text>
        </Box>
      </Box>
      <SectionWithDescription
        title="Connect SMTP"
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
                control={control}
                name="name"
                label="Configuration name"
                helperText="Name of the configuration, for example 'Production' or 'Test'"
              />
              <Divider />
              <Text variant="heading">SMTP server connection</Text>
              <Input
                label="Host"
                helperText="Server host that will be connected."
                control={control}
                name="smtpHost"
              />
              <Input
                label="Port"
                name="smtpPort"
                control={control}
                helperText="Port that will be used"
              />
              <Input
                label="User"
                name="smtpUser"
                control={control}
                helperText="User for the SMTP server connection"
              />
              <Input
                label="Password"
                name="smtpPassword"
                control={control}
                helperText="Password for the SMTP server connection"
              />

              <Box display="flex" gap={defaultPadding}>
                <label>
                  <input {...register("encryption")} type="radio" value="NONE" />
                  <Text paddingLeft={defaultPadding}>No encryption</Text>
                </label>
                <label>
                  <input {...register("encryption")} type="radio" value="SSL" />
                  <Text paddingLeft={defaultPadding}>SSL</Text>
                </label>
                <label>
                  <input {...register("encryption")} type="radio" value="TLS" />
                  <Text paddingLeft={defaultPadding}>TLS</Text>
                </label>
              </Box>
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

export default NewSmtpConfigurationPage;
