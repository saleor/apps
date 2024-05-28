import { Box, Button } from "@saleor/macaw-ui";
import { Input } from "@saleor/react-hook-form-macaw";
import { useFieldArray, useFormContext } from "react-hook-form";
import { AvataxConfig } from "../avatax-connection-schema";
import { FormSection } from "./form-section";

export const LogsSettingsFragment = () => {
  const { control } = useFormContext<AvataxConfig>();

  const { fields, append, remove } = useFieldArray({
    control,
    name: "logsSettings.otel.headers",
  });

  return (
    <>
      <FormSection title="Logs settings">
        <Input
          control={control}
          name="logsSettings.otel.url"
          required
          label="Where to emit events"
        />
        <Box title="Headers" width="100%" display="grid" gap={2}>
          <Box width="100%" display="grid" gap={3}>
            {fields.map((field, index) => (
              <Box display="flex" width="100%" justifyContent="space-between">
                <Input
                  control={control}
                  key={field.id}
                  name={`logsSettings.otel.headers.${index}.key`}
                  label="Key"
                />
                <Input
                  control={control}
                  key={field.id}
                  name={`logsSettings.otel.headers.${index}.value`}
                  label="Value"
                />
                <Button onClick={() => remove(index)}>Remove</Button>
              </Box>
            ))}
          </Box>
          <Button onClick={() => append({ key: "", value: "" })} variant="secondary">
            Add +
          </Button>
        </Box>
      </FormSection>
    </>
  );
};
