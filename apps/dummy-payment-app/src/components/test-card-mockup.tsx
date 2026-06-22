import { Box, Text } from "@saleor/macaw-ui";

/** Soft ambient sheen — matches storefront checkout dummy payment card. */
const CARD_SURFACE_STYLE = {
  background: [
    "radial-gradient(130% 100% at 0% 0%, rgba(255,255,255,0.11), transparent 52%)",
    "radial-gradient(130% 100% at 100% 100%, rgba(255,255,255,0.11), transparent 52%)",
    "linear-gradient(168deg, oklch(0.2 0 0) 0%, oklch(0.11 0 0) 45%, oklch(0.15 0 0) 100%)",
  ].join(", "),
  boxShadow: [
    "inset 0 1px 0 rgba(255,255,255,0.14)",
    "inset 0 -1px 0 rgba(0,0,0,0.25)",
    "0 2px 16px rgba(0,0,0,0.1)",
  ].join(", "),
} as const;

const SIZE_CONFIG = {
  md: {
    maxWidth: "280px",
    padding: 4,
    borderRadius: 4,
    number: "•••• •••• •••• 4242",
    label: "Test cardholder",
  },
  lg: {
    maxWidth: undefined,
    padding: 5,
    borderRadius: 4,
    number: "•••• •••• •••• 4242",
    label: "Test cardholder",
  },
} as const;

interface TestCardMockupProps {
  size?: keyof typeof SIZE_CONFIG;
  /** Fill the parent column width (e.g. overview sidebar). */
  fill?: boolean;
}

/**
 * Decorative card preview — non-interactive, same visual as storefront checkout.
 */
export function TestCardMockup({ size = "md", fill = false }: TestCardMockupProps) {
  const config = SIZE_CONFIG[size];

  return (
    <Box
      aria-hidden
      position="relative"
      __width={fill ? "100%" : config.maxWidth ?? "100%"}
      style={{ aspectRatio: "856/520" }}
    >
      <Box
        position="absolute"
        __top="0"
        __left="0"
        __right="0"
        __bottom="0"
        borderRadius={config.borderRadius}
        padding={config.padding}
        overflow="hidden"
        style={CARD_SURFACE_STYLE}
      >
        <Box
          position="relative"
          display="flex"
          flexDirection="column"
          justifyContent="space-between"
          __height="100%"
          __zIndex="1"
        >
          <Box display="flex" justifyContent="flex-end">
            <Text
              size={1}
              fontWeight="medium"
              style={{
                color: "rgba(255,255,255,0.45)",
                textAlign: "right",
                lineHeight: 1.3,
                fontSize: fill ? "9px" : "10px",
              }}
            >
              Saleor Dummy Payment
            </Text>
          </Box>
          <Text
            size={size === "md" ? 3 : 4}
            style={{
              fontFamily: "monospace",
              letterSpacing: "0.15em",
              color: "rgba(255,255,255,0.9)",
            }}
          >
            {config.number}
          </Text>
          <Box display="flex" alignItems="flex-end" justifyContent="space-between">
            <Text
              size={2}
              style={{
                textTransform: "uppercase",
                letterSpacing: "0.05em",
                color: "rgba(255,255,255,0.6)",
              }}
            >
              {config.label}
            </Text>
            <Text size={2} style={{ color: "rgba(255,255,255,0.6)" }}>
              12/28
            </Text>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
