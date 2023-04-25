import { Box, Button, Input, Text } from "@saleor/macaw-ui/next";
import { NextPage } from "next";
import { Breadcrumbs } from "../../../components/breadcrumbs";
import { SectionWithDescription } from "../../../components/section-with-description";
import { BoxWithBorder } from "../../../components/box-with-border";
import { defaultPadding } from "../../../components/ui-defaults";
import { BoxFooter } from "../../../components/box-footer";
import { trpcClient } from "../../../modules/trpc/trpc-client";
import { useDashboardNotification } from "@saleor/apps-shared/src/use-dashboard-notification";
import { Controller, useForm } from "react-hook-form";
import { SendgridCreateConfigurationSchemaType } from "../../../modules/sendgrid/configuration/sendgrid-config-input-schema";

const NewSendgridConfigurationPage: NextPage = () => {
  const { notifySuccess, notifyError } = useDashboardNotification();

  const { handleSubmit, control, setError } = useForm<SendgridCreateConfigurationSchemaType>();

  const { mutate: createConfiguration } =
    trpcClient.sendgridConfiguration.createConfiguration.useMutation({
      onSuccess: async (data, variables) => {
        notifySuccess("Configuration saved");
        // TODO: redirect to configuration details based on id
      },
      onError(error) {
        let isFieldErrorSet = false;
        const fieldErrors = error.data?.zodError?.fieldErrors || {};
        for (const fieldName in fieldErrors) {
          for (const message of fieldErrors[fieldName] || []) {
            isFieldErrorSet = true;
            setError(fieldName as keyof SendgridCreateConfigurationSchemaType, {
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
    <Box padding={10} display={"grid"} gap={13}>
      <Breadcrumbs
        items={[
          { name: "Configuration", href: "/" },
          { name: "Add provider" },
          { name: "Sendgrid" },
        ]}
      />
      <Box display={"grid"} gridTemplateColumns={{ desktop: 3, mobile: 1 }}>
        <Box>
          <Text>Connect Sendgrid with Saleor.</Text>
        </Box>
      </Box>
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
              createConfiguration({
                ...data,
              });
            })}
          >
            <Box padding={defaultPadding} display={"flex"} flexDirection={"column"} gap={10}>
              <Controller
                name="configurationName"
                control={control}
                render={({
                  field: { onChange, value },
                  fieldState: { error },
                  formState: { errors },
                }) => (
                  <Input
                    label="Configuration name"
                    value={value}
                    onChange={onChange}
                    error={!!error}
                    helperText={
                      error?.message ||
                      "Name of the configuration, for example 'Production' or 'Test'"
                    }
                  />
                )}
              />
              <Controller
                name="apiKey"
                control={control}
                render={({
                  field: { onChange, value },
                  fieldState: { error },
                  formState: { errors },
                }) => (
                  // TODO: add validation
                  <Input
                    label="API key"
                    value={value}
                    onChange={onChange}
                    error={!!error}
                    helperText={
                      error?.message || "Your API key, ensure it has permission XYZ enabled"
                    }
                  />
                )}
              />
            </Box>
            <BoxFooter>
              <Button type="submit">Save provider</Button>
            </BoxFooter>
          </form>
        </BoxWithBorder>
      </SectionWithDescription>
    </Box>
  );
};

export default NewSendgridConfigurationPage;
