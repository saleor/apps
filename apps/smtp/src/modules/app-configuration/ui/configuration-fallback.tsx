import { SkeletonLayout } from "@saleor/apps-ui";
import { Box, Checkbox, Paragraph, Text } from "@saleor/macaw-ui";

import { BoxWithBorder } from "../../../components/box-with-border";
import { defaultPadding } from "../../../components/ui-defaults";

export const ConfigurationFallback = (props: {
  useSaleorSmtpFallback: boolean | undefined;
  fallbackRedirectEmail: string | null | undefined;
  loading: boolean;
  saving: boolean;
  onChange: (value: boolean) => void;
}) => {
  if (props.loading || props.useSaleorSmtpFallback === undefined) {
    return (
      <BoxWithBorder>
        <Box padding={defaultPadding}>
          <SkeletonLayout.Section />
        </Box>
      </BoxWithBorder>
    );
  }

  if (!props.useSaleorSmtpFallback) {
    return (
      <BoxWithBorder>
        <Box padding={defaultPadding}>
          <Text fontSize={4} fontWeight="bold">
            Fallback SMTP is not enabled
          </Text>
          <Paragraph marginTop={2} color="default2">
            Fallback SMTP is not enabled for this installation. Contact Saleor support to enable it.
          </Paragraph>
        </Box>
      </BoxWithBorder>
    );
  }

  if (props.fallbackRedirectEmail) {
    return (
      <BoxWithBorder>
        <Box padding={defaultPadding}>
          <Text fontSize={4} fontWeight="bold">
            Fallback SMTP is enabled
          </Text>
          <Paragraph marginTop={2} color="default2">
            Events not covered by custom configuration will be sent to{" "}
            <Text fontWeight="bold">{props.fallbackRedirectEmail}</Text> using Saleor Cloud SMTP
            server.
          </Paragraph>
        </Box>
      </BoxWithBorder>
    );
  }

  return (
    <BoxWithBorder>
      <Box padding={defaultPadding}>
        <Checkbox
          disabled={props.saving}
          checked={props.useSaleorSmtpFallback}
          onCheckedChange={(v) => {
            props.onChange(v as boolean);
          }}
          name="useSaleorSmtpFallback"
        >
          <Text fontSize={4}>Use Saleor Cloud Sandbox SMTP server as a fallback</Text>
        </Checkbox>
        <Paragraph marginTop={2} color="default2">
          Decide whether events not covered by custom configuration should be handled by Saleor
          Cloud SMTP server or ignored
        </Paragraph>
      </Box>
    </BoxWithBorder>
  );
};
