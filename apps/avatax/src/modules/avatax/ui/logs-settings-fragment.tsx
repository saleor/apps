import { Box, Text, Textarea } from "@saleor/macaw-ui";
import { Input } from "@saleor/react-hook-form-macaw";
import { Controller, useFormContext, useWatch } from "react-hook-form";
import { AppToggle } from "../../ui/app-toggle";
import { AvataxConfig } from "../avatax-connection-schema";
import { HelperText } from "./form-helper-text";

export const LogsSettingsFragment = () => {
  const { control, formState } = useFormContext<AvataxConfig>();
  const isOtelTogleEnabled = useWatch({
    control,
    name: "logsSettings.otel.enabled",
  });
  const isHttpTogleEnabled = useWatch({
    control,
    name: "logsSettings.http.enabled",
  });

  return (
    <>
      <Box>
        <Text marginBottom={4} as="h3" variant="heading">
          Logs settings
        </Text>
        <Box display="grid" gap={2}>
          <HelperText>
            Configure where AvaTax should emit logs. This is useful for debugging and
            troubleshooting connection issues.
          </HelperText>
          <AppToggle
            name="logsSettings.otel.enabled"
            control={control}
            label="OTEL transport"
            helperText={<HelperText>Enable sending logs using OpenTelemetry protocol.</HelperText>}
          />
          <Box display="grid" gap={2}>
            <Input
              control={control}
              name="logsSettings.otel.url"
              label="URL to send logs to"
              helperText={formState.errors.logsSettings?.otel?.url?.message}
              disabled={!isOtelTogleEnabled}
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
                  disabled={!isOtelTogleEnabled}
                />
              )}
            />
          </Box>

          <AppToggle
            name="logsSettings.http.enabled"
            control={control}
            label="HTTP transport"
            helperText={<HelperText>Enable sending logs using HTTP protocol.</HelperText>}
          />
          <Box display="grid" gap={2}>
            <Input
              control={control}
              name="logsSettings.http.url"
              label="URL to send logs to"
              helperText={formState.errors.logsSettings?.http?.url?.message}
              disabled={!isHttpTogleEnabled}
            />
            <Controller
              name="logsSettings.http.headers"
              control={control}
              render={({ field, fieldState: { error } }) => (
                <Textarea
                  {...field}
                  error={!!error}
                  helperText={formState.errors.logsSettings?.http?.headers?.message}
                  label="Request headers in JSON format"
                  disabled={!isHttpTogleEnabled}
                />
              )}
            />
          </Box>
        </Box>
      </Box>
    </>
  );
};
