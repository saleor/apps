import { Layout } from "@saleor/apps-ui";
import { Box, Button, Text } from "@saleor/macaw-ui";
import { useRouter } from "next/router";

export const EmptyConfigs = () => {
  const router = useRouter();

  return (
    <Layout.AppSectionCard
      footer={
        <Box display="flex" justifyContent="flex-end">
          <Button onClick={() => router.push("/config/new")}>Add Stripe configuration</Button>
        </Box>
      }
    >
      <Text display="block" as="h2" size={6} marginBottom={4}>
        It looks so empty!
      </Text>
      <Text>Create your first Stripe configuration</Text>
    </Layout.AppSectionCard>
  );
};
