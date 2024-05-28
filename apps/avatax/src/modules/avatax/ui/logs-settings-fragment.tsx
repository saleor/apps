import { Box, Text, Textarea } from "@saleor/macaw-ui";
import { Input } from "@saleor/react-hook-form-macaw";
import { Controller, useFormContext } from "react-hook-form";
import { AvataxConfig } from "../avatax-connection-schema";

export const LogsSettingsFragment = () => {
  const { control, formState } = useFormContext<AvataxConfig>();

  return (
    <>
      <Box>
        <Text marginBottom={4} as="h3" variant="heading">
          Logs settings
        </Text>
        <Box display="grid" gap={2}>
          <Text>
            Configure where AvaTax should emit logs. This is useful for debugging and
            troubleshooting connection issues.
          </Text>
          <Box display="grid" gap={2}>
            <Input
              control={control}
              name="logsSettings.otel.url"
              label="URL to send logs to"
              helperText={formState.errors.logsSettings?.otel?.url?.message}
            />
            <Controller
              name="logsSettings.otel.headers"
              control={control}
              render={({ field, fieldState: { error } }) => (
                <Textarea
                  {...field}
                  error={!!error}
                  helperText={formState.errors.logsSettings?.otel?.headers?.message}
                  label="Request headers in JSON format"
                />
              )}
            />
          </Box>
        </Box>
      </Box>
    </>
  );
};
