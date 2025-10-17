import { Box, Text } from "@saleor/macaw-ui";

import { MjmlPreview } from "./mjml-preview";

interface TemplatePreviewProps {
  subject: string;
  template: string | null;
  isUpdating: boolean;
}

export const TemplatePreview = ({ subject, template, isUpdating }: TemplatePreviewProps) => {
  return (
    <>
      <Box display="flex" justifyContent="space-between" alignItems="center">
        <Text size={5} fontWeight="bold" as="p">
          Subject: {subject}
        </Text>
        {isUpdating && (
          <Text size={2} color="default2">
            Updating preview...
          </Text>
        )}
      </Box>

      {template ? (
        <Box
          style={{
            opacity: isUpdating ? 0.6 : 1,
            transition: "opacity 0.2s",
          }}
        >
          <MjmlPreview value={template} />
        </Box>
      ) : (
        <Text>No template preview</Text>
      )}
    </>
  );
};
