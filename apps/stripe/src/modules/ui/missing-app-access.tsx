import { Box, Text } from "@saleor/macaw-ui";

/** Dashboard user is missing at least one of `REQUIRED_CLIENT_PERMISSIONS`. */
export const MissingAppAccess = () => (
  <Box padding={6}>
    <Text>You do not have permission to access this page.</Text>
  </Box>
);
