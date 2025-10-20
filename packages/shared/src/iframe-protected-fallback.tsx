import { Box, Text } from "@saleor/macaw-ui";

interface IframeProtectedFallbackProps {
  /**
   * The name of the app to display in the heading
   */
  appName: string;
}

/**
 * Standard fallback component to show when the app is accessed outside
 * of the Saleor Dashboard iframe.
 *
 * Use this with IframeProtectedWrapper to provide a consistent user experience
 * across all apps.
 */
export function IframeProtectedFallback({ appName }: IframeProtectedFallbackProps) {
  return (
    <Box display="flex" flexDirection="column" padding={10}>
      <Text as="h1" fontWeight="bold" fontSize={8} marginBottom={6}>
        {appName}
      </Text>
      <Text>This app can only be used within the Saleor Dashboard.</Text>
    </Box>
  );
}
