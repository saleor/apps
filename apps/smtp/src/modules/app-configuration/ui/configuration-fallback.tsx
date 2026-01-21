import { SkeletonLayout } from "@saleor/apps-ui";
import { Box, Checkbox, Paragraph, Text } from "@saleor/macaw-ui";

import { BoxWithBorder } from "../../../components/box-with-border";
import { defaultPadding } from "../../../components/ui-defaults";

export const ConfigurationFallback = (props: {
  useSaleorSmtpFallback: boolean;
  loading: boolean;
  onChange: (value: boolean) => void;
}) => {
  if (props.loading) {
    return (
      <BoxWithBorder>
        <Box padding={defaultPadding}>
          <SkeletonLayout.Section/>
        </Box>
      </BoxWithBorder>
    );
  }

  return (
    <BoxWithBorder>
      <Box padding={defaultPadding}>
        <Checkbox
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
