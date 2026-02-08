import { Box, Text } from "@saleor/macaw-ui";

interface TemplatePreviewProps {
  subject: string;
  template: string | null;
  isUpdating: boolean;
}

export const TemplatePreview = ({ subject, template, isUpdating }: TemplatePreviewProps) => {
  return (
    <Box
      display="flex"
      flexDirection="column"
      borderRadius={4}
      borderWidth={1}
      borderStyle="solid"
      borderColor="default1"
      backgroundColor="default1"
      style={{
        height: "100%",
        overflow: "hidden",
        opacity: isUpdating ? 0.7 : 1,
        transition: "opacity 0.2s ease",
      }}
    >
      <Box
        padding={4}
        borderBottomWidth={1}
        borderBottomStyle="solid"
        borderColor="default1"
        backgroundColor="default1"
        flexShrink="0"
      >
        <Text
          size={1}
          color="default2"
          as="p"
          style={{
            textTransform: "uppercase",
            letterSpacing: "0.1em",
            fontSize: "11px",
            marginBottom: "4px",
          }}
        >
          Subject
        </Text>
        <Text size={4} color="default1" as="p">
          {subject || "\u00A0"}
        </Text>
      </Box>

      <Box style={{ flex: 1, minHeight: 0 }}>
        {template ? (
          <iframe
            srcDoc={template}
            title="Email Preview"
            sandbox=""
            style={{
              width: "100%",
              height: "100%",
              border: "none",
              display: "block",
              background: "#ffffff",
            }}
          />
        ) : (
          <Box
            display="flex"
            alignItems="center"
            justifyContent="center"
            padding={8}
            style={{ height: "100%" }}
          >
            <Text color="default2" size={3}>
              No template preview
            </Text>
          </Box>
        )}
      </Box>
    </Box>
  );
};
