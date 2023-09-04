import { Box, Text } from "@saleor/macaw-ui/next";
import { TaxJarLogsTable, RefreshLogsButton } from "./taxjar-logs-table";

export const TaxJarLogs = () => {
  return (
    <section>
      <Box alignItems={"center"} display={"flex"} justifyContent={"space-between"}>
        <Text variant="heading" as="h2">
          Logs
        </Text>
        <RefreshLogsButton />
      </Box>
      <TaxJarLogsTable />
    </section>
  );
};
