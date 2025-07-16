import { Layout } from "@saleor/apps-ui";
import { Box, Button, Text } from "@saleor/macaw-ui";
import { useRouter } from "next/router";

export const EmptyConfigs = () => {
  const router = useRouter();

  return (
    <Layout.AppSectionCard
      footer={
        <Box display="flex" justifyContent="flex-end">
          <Button onClick={() => router.push("/config/new")}>Add configuration</Button>
        </Box>
      }
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
