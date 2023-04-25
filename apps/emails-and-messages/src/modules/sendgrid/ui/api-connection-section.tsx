import { useRouter } from "next/router";
import { SendgridConfiguration } from "../configuration/sendgrid-config";
import { BoxWithBorder } from "../../../components/box-with-border";
import { Box, Button, Input, RadioGroup, Text } from "@saleor/macaw-ui/next";
import { defaultPadding } from "../../../components/ui-defaults";
import { useDashboardNotification } from "@saleor/apps-shared";
import { trpcClient } from "../../trpc/trpc-client";
import { sendgridUpdateBasicInformationSchema } from "../configuration/sendgrid-config-input-schema";
import { z } from "zod";
import { Controller, useForm } from "react-hook-form";
import { BoxFooter } from "../../../components/box-footer";
import { SectionWithDescription } from "../../../components/section-with-description";

interface ApiConnectionSectionProps {
  configuration?: SendgridConfiguration;
}

export const ApiConnectionSection = ({ configuration }: ApiConnectionSectionProps) => {
  const { replace } = useRouter();
  const { notifySuccess, notifyError } = useDashboardNotification();

  const { handleSubmit, control, setError } = useForm<
    z.infer<typeof sendgridUpdateBasicInformationSchema>
  >({
    defaultValues: {
      configurationName: configuration?.configurationName,
      active: configuration?.active,
    },
  });

  const { mutate: createConfiguration } =
    trpcClient.sendgridConfiguration.updateBasicInformation.useMutation({
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
            setError(fieldName as keyof z.infer<typeof sendgridUpdateBasicInformationSchema>, {
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

  if (!configuration) {
    return (
      <BoxWithBorder padding={10} display={"grid"} alignItems={"center"} justifyContent={"center"}>
        <Text>Loading</Text>
      </BoxWithBorder>
    );
  }

  return (
    <SectionWithDescription title="API Connection">
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
              name="apiKey"
              control={control}
              render={({
                field: { onChange, value },
                fieldState: { error },
                formState: { errors },
              }) => (
                <Input
                  label="API Key"
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
              name="sandboxMode"
              control={control}
              render={({
                field: { onChange, value },
                fieldState: { error },
                formState: { errors },
              }) => (
                // TODO: add validation
                <RadioGroup value={value?.toString()} onChange={(e) => console.log(e)}>
                  <RadioGroup.Item id="default-unchecked" value="live">
                    <Text>Live</Text>
                  </RadioGroup.Item>
                  <RadioGroup.Item id="default-checked" value="sandbox">
                    <Text>Sandbox</Text>
                  </RadioGroup.Item>
                </RadioGroup>
              )}
            />
          </Box>
          <BoxFooter>
            <Button type="submit">Save provider</Button>
          </BoxFooter>
        </form>
      </BoxWithBorder>
    </SectionWithDescription>
  );
};
