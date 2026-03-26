import { Box, Text } from "@saleor/macaw-ui";

interface PermissionMissingWarningProps {
  permission: string;
}

export const PermissionMissingWarning = ({ permission }: PermissionMissingWarningProps) => {
  return (
    <Box
      borderColor="default2"
      borderWidth={1}
      borderStyle="solid"
      borderRadius={4}
      padding={4}
      backgroundColor="default2"
    >
      <Text as="p" size={3} fontWeight="bold" marginBottom={2}>
        Missing permission: {permission}
      </Text>
      <Text as="p" size={2} marginBottom={2}>
        This feature requires the {permission} permission. Please grant this permission for the app in your Saleor Dashboard (Apps → Manage App).
      </Text>
      <Text as="p" size={2} color="default2">
        If you cannot manage permissions in Dashboard, you may need to reinstall the app, but note that all app configurations will be lost after reinstalling.
      </Text>
    </Box>
  );
};
