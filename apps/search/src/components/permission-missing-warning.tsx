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
        This feature requires the {permission} permission. Please reinstall the app (all
        configurations will be lost)
      </Text>
    </Box>
  );
};
