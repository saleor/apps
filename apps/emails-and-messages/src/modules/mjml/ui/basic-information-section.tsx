import { MjmlConfiguration } from "../configuration/mjml-config-schema";
import { BoxWithBorder } from "../../../components/box-with-border";
import { Box, Button, Input, RadioGroup, Text } from "@saleor/macaw-ui/next";
import { defaultPadding } from "../../../components/ui-defaults";
import { useDashboardNotification } from "@saleor/apps-shared";
import { trpcClient } from "../../trpc/trpc-client";
import { z } from "zod";
import { Controller, useForm } from "react-hook-form";
import { BoxFooter } from "../../../components/box-footer";
import { SectionWithDescription } from "../../../components/section-with-description";
import {
  MjmlUpdateBasicInformation,
  mjmlUpdateBasicInformationSchema,
} from "../configuration/mjml-config-input-schema";

interface BasicInformationSectionProps {
  configuration: MjmlConfiguration;
}

export const BasicInformationSection = ({ configuration }: BasicInformationSectionProps) => {
  const { notifySuccess, notifyError } = useDashboardNotification();
  const { handleSubmit, control, setError, register } = useForm<MjmlUpdateBasicInformation>({
    defaultValues: {
      id: configuration.id,
      name: configuration.name,
      active: configuration.active,
    },
  });

  const trpcContext = trpcClient.useContext();
  const { mutate } = trpcClient.mjmlConfiguration.updateBasicInformation.useMutation({
    onSuccess: async (data, variables) => {
      notifySuccess("Configuration saved");
      trpcContext.mjmlConfiguration.invalidate();
    },
    onError(error) {
      let isFieldErrorSet = false;
      const fieldErrors = error.data?.zodError?.fieldErrors || {};
      for (const fieldName in fieldErrors) {
        for (const message of fieldErrors[fieldName] || []) {
          isFieldErrorSet = true;
          setError(fieldName as keyof z.infer<typeof mjmlUpdateBasicInformationSchema>, {
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
