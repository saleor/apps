import { zodResolver } from "@hookform/resolvers/zod";
import { useDashboardNotification } from "@saleor/apps-shared/use-dashboard-notification";
import { Box, Button, Text } from "@saleor/macaw-ui";
import { Input } from "@saleor/react-hook-form-macaw";
import { useFieldArray, useForm } from "react-hook-form";

import { BoxFooter } from "../../../components/box-footer";
import { BoxWithBorder } from "../../../components/box-with-border";
import { SectionWithDescription } from "../../../components/section-with-description";
import { defaultPadding } from "../../../components/ui-defaults";
import { setBackendErrors } from "../../../lib/set-backend-errors";
import { trpcClient } from "../../trpc/trpc-client";
import {
  type SmtpUpdateCustomVariables,
  smtpUpdateCustomVariablesSchema,
} from "../configuration/smtp-config-input-schema";
import { type SmtpConfiguration } from "../configuration/smtp-config-schema";

interface SmtpCustomVariablesSectionProps {
  configuration: SmtpConfiguration;
}

const configurationToVariables = (configuration: SmtpConfiguration) =>
  Object.entries(configuration.customVariables ?? {}).map(([key, value]) => ({ key, value }));

export const SmtpCustomVariablesSection = ({ configuration }: SmtpCustomVariablesSectionProps) => {
  const { notifySuccess, notifyError } = useDashboardNotification();
  const { handleSubmit, control, setError } = useForm<SmtpUpdateCustomVariables>({
    defaultValues: {
      id: configuration.id,
      variables: configurationToVariables(configuration),
    },
    resolver: zodResolver(smtpUpdateCustomVariablesSchema),
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "variables",
  });

  const trpcContext = trpcClient.useContext();
  const { mutate } = trpcClient.smtpConfiguration.updateCustomVariables.useMutation({
    onSuccess: async () => {
      notifySuccess("Configuration saved");
      trpcContext.smtpConfiguration.invalidate();
    },
    onError(error) {
      setBackendErrors<SmtpUpdateCustomVariables>({
        error,
        setError,
        notifyError,
      });
    },
  });

  return (
    <SectionWithDescription
      title="Custom variables"
      description={
        <Box display="flex" flexDirection="column" gap={2}>
          <Text as="p">
            Define global key-value pairs (e.g. storefront URL, support email) that are available in
            every template for this configuration.
          </Text>
          <Text as="p">
            Reference them as{" "}
            <Text as="span" fontWeight="bold">
              {"{{customVariables.key}}"}
            </Text>
            . Keys must start with a letter or underscore and contain only letters, numbers and
            underscores.
          </Text>
        </Box>
      }
    >
      <BoxWithBorder>
        <form onSubmit={handleSubmit((data) => mutate(data))}>
          <Box padding={defaultPadding} display="flex" flexDirection="column" gap={6}>
            {fields.length === 0 ? (
              <Text color="default2">No custom variables defined yet.</Text>
            ) : (
              fields.map((field, index) => (
                <Box key={field.id} display="flex" gap={4} alignItems="flex-start">
                  <Box style={{ flex: 1 }}>
                    <Input
                      label="Key"
                      name={`variables.${index}.key`}
                      control={control}
                      placeholder="storefrontUrl"
                    />
                  </Box>
                  <Box style={{ flex: 2 }}>
                    <Input
                      label="Value"
                      name={`variables.${index}.value`}
                      control={control}
                      placeholder="https://example.com"
                    />
                  </Box>
                  <Box paddingTop={5}>
                    <Button
                      variant="tertiary"
                      type="button"
                      onClick={() => remove(index)}
                      aria-label="Remove variable"
                    >
                      Remove
                    </Button>
                  </Box>
                </Box>
              ))
            )}
            <Box>
              <Button
                variant="secondary"
                type="button"
                onClick={() => append({ key: "", value: "" })}
              >
                Add variable
              </Button>
            </Box>
          </Box>
          <BoxFooter>
            <Button type="submit">Save custom variables</Button>
          </BoxFooter>
        </form>
      </BoxWithBorder>
    </SectionWithDescription>
  );
};
