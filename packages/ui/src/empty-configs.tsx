import { Box, BoxProps, Button, Text } from "@saleor/macaw-ui";

import { Layout } from "./layout";

export type EmptyConfigsProps = BoxProps & {
  onConfigurationAdd(): void;
};

export const EmptyConfigs = ({ onConfigurationAdd, ...props }: EmptyConfigsProps) => {
  return (
    <Layout.AppSectionCard
      footer={
        <Box display="flex" justifyContent="flex-end">
          <Button onClick={onConfigurationAdd}>Add configuration</Button>
        </Box>
      }
      {...props}
    >
      <Text as="h2" size={5} marginBottom={4}>
        No configurations found
      </Text>
      <Text size={3} color="default2">
        Create your first configuration to get started.
      </Text>
    </Layout.AppSectionCard>
  );
};
