import { useRouter } from "next/router";
import { SendgridConfiguration } from "../configuration/sendgrid-config";
import { BoxWithBorder } from "../../../components/box-with-border";
import { Box, Button, Combobox, Text } from "@saleor/macaw-ui/next";
import { defaultPadding } from "../../../components/ui-defaults";
import { useDashboardNotification } from "@saleor/apps-shared";
import { trpcClient } from "../../trpc/trpc-client";
import { sendgridUpdateBasicInformationSchema } from "../configuration/sendgrid-config-input-schema";
import { z } from "zod";
import { Controller, useForm } from "react-hook-form";
import { BoxFooter } from "../../../components/box-footer";
import { SectionWithDescription } from "../../../components/section-with-description";

interface SenderSectionProps {
  configuration?: SendgridConfiguration;
}

export const SenderSection = ({ configuration }: SenderSectionProps) => {
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
    <SectionWithDescription title="Sender">
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
              name="sender"
              control={control}
              render={({
                field: { onChange, value },
                fieldState: { error },
                formState: { errors },
              }) => (
                <Combobox
                  label="Sender"
                  value={value}
                  options={[
                    { label: "test", value: "test" },
                    { label: "test", value: "test" },
                  ]}
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
  );
};
