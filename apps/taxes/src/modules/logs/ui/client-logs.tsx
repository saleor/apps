import { Box, Text } from "@saleor/macaw-ui/next";
import { ClientLogsTable, RefreshLogsButton } from "./client-logs-table";

export const ClientLogs = () => {
  return (
    <section>
      <Box alignItems={"center"} display={"flex"} justifyContent={"space-between"}>
        <Text variant="heading" as="h2">
          Logs
        </Text>
        <RefreshLogsButton />
      </Box>
      <ClientLogsTable />
    </section>
  );
};
