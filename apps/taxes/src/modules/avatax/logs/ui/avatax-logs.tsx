import { Text } from "@saleor/macaw-ui/next";
import { AvataxLogsTable } from "./avatax-logs-table";

export const AvataxLogs = () => {
  return (
    <section>
      <Text variant="heading" as="h2">
        Logs
      </Text>
      <AvataxLogsTable />
    </section>
  );
};
