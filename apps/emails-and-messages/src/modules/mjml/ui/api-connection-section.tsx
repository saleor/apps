import { SendgridConfiguration } from "../configuration/sendgrid-config-schema";
import { BoxWithBorder } from "../../../components/box-with-border";
import { Box, Button, Input, Text } from "@saleor/macaw-ui/next";
import { defaultPadding } from "../../../components/ui-defaults";
import { useDashboardNotification } from "@saleor/apps-shared";
import { trpcClient } from "../../trpc/trpc-client";
import { SendgridUpdateApiConnection } from "../configuration/sendgrid-config-input-schema";
import { Controller, useForm } from "react-hook-form";
import { BoxFooter } from "../../../components/box-footer";
import { SectionWithDescription } from "../../../components/section-with-description";

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
  });

  const trpcContext = trpcClient.useContext();
  const { mutate } = trpcClient.sendgridConfiguration.updateApiConnection.useMutation({
    onSuccess: async (data, variables) => {
      notifySuccess("Configuration saved");
      trpcContext.sendgridConfiguration.invalidate();
    },
    onError(error) {
      let isFieldErrorSet = false;
      const fieldErrors = error.data?.zodError?.fieldErrors || {};
      for (const fieldName in fieldErrors) {
        for (const message of fieldErrors[fieldName] || []) {
          isFieldErrorSet = true;
          setError(fieldName as keyof SendgridUpdateApiConnection, {
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
    <SectionWithDescription title="API Connection">
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
