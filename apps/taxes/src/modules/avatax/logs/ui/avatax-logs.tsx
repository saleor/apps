import { Box, Text } from "@saleor/macaw-ui/next";
import { AvataxLogsTable, RefreshLogsButton } from "./avatax-logs-table";

export const AvataxLogs = () => {
  return (
    <section>
      <Box alignItems={"center"} display={"flex"} justifyContent={"space-between"}>
        <Text variant="heading" as="h2">
          Logs
        </Text>
        <RefreshLogsButton />
      </Box>
      <AvataxLogsTable />
    </section>
  );
};
