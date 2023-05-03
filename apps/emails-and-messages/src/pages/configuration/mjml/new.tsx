import { Box, Button, Divider, Input, Text } from "@saleor/macaw-ui/next";
import { NextPage } from "next";
import { SectionWithDescription } from "../../../components/section-with-description";
import { BoxWithBorder } from "../../../components/box-with-border";
import { defaultPadding } from "../../../components/ui-defaults";
import { BoxFooter } from "../../../components/box-footer";
import { trpcClient } from "../../../modules/trpc/trpc-client";
import { useDashboardNotification } from "@saleor/apps-shared/src/use-dashboard-notification";
import { Controller, useForm } from "react-hook-form";
import { MjmlCreateConfigurationInput } from "../../../modules/mjml/configuration/mjml-config-input-schema";
import { BasicLayout } from "../../../components/basic-layout";
import { useRouter } from "next/router";

const NewMjmlConfigurationPage: NextPage = () => {
  const router = useRouter();
  const { notifySuccess, notifyError } = useDashboardNotification();

  const { handleSubmit, control, setError, register } = useForm<MjmlCreateConfigurationInput>();

  const { mutate } = trpcClient.mjmlConfiguration.createConfiguration.useMutation({
    onSuccess: async (data, variables) => {
      notifySuccess("Configuration saved");
      router.push(`/configuration/mjml/edit/${data.id}`);
    },
    onError(error) {
      let isFieldErrorSet = false;
      const fieldErrors = error.data?.zodError?.fieldErrors || {};
      for (const fieldName in fieldErrors) {
        for (const message of fieldErrors[fieldName] || []) {
          isFieldErrorSet = true;
          setError(fieldName as keyof MjmlCreateConfigurationInput, {
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
    <BasicLayout
      breadcrumbs={[
        { name: "Configuration", href: "/" },
        { name: "Add provider" },
        { name: "Mjml" },
      ]}
    >
      <Box display={"grid"} gridTemplateColumns={{ desktop: 3, mobile: 1 }}>
        <Box>
          <Text>Connect Mjml with Saleor.</Text>
        </Box>
      </Box>
      <SectionWithDescription
        title="Connect Mjml"
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
            <Box padding={defaultPadding} display={"flex"} flexDirection={"column"} gap={10}>
              <Controller
                name="name"
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
              <Divider />
              <Text variant="heading">SMTP server connection</Text>
              <Controller
                name="smtpHost"
                control={control}
                render={({
                  field: { onChange, value },
                  fieldState: { error },
                  formState: { errors },
                }) => (
                  <Input
                    label="Host"
                    value={value}
                    onChange={onChange}
                    error={!!error}
                    helperText={error?.message || "Server host that will be connected."}
                  />
                )}
              />
              <Controller
                name="smtpPort"
                control={control}
                render={({
                  field: { onChange, value },
                  fieldState: { error },
                  formState: { errors },
                }) => (
                  <Input
                    label="Port"
                    value={value}
                    onChange={onChange}
                    error={!!error}
                    helperText={error?.message}
                  />
                )}
              />
              <Controller
                name="smtpUser"
                control={control}
                render={({
                  field: { onChange, value },
                  fieldState: { error },
                  formState: { errors },
                }) => (
                  <Input
                    label="User"
                    value={value}
                    onChange={onChange}
                    error={!!error}
                    helperText={error?.message}
                  />
                )}
              />
              <Controller
                name="smtpPassword"
                control={control}
                render={({
                  field: { onChange, value },
                  fieldState: { error },
                  formState: { errors },
                }) => (
                  <Input
                    label="Password"
                    value={value}
                    onChange={onChange}
                    error={!!error}
                    helperText={error?.message}
                  />
                )}
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

export default NewMjmlConfigurationPage;
