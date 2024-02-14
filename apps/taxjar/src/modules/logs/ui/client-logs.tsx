import { Box, Button, Spinner, Text } from "@saleor/macaw-ui";
import { ClientLogsTable } from "./client-logs-table";
import { useRouter } from "next/router";
import { z } from "zod";
import { trpcClient } from "../../trpc/trpc-client";

const RefreshLogsButton = () => {
  const router = useRouter();
  const { id } = router.query;
  const configurationId = z.string().parse(id ?? "");

  const { refetch, isRefetching } = trpcClient.clientLogs.getAll.useQuery({
    id: configurationId,
  });

  return (
    <Button minWidth={16} variant="secondary" size="small" onClick={() => refetch()}>
      {isRefetching ? <Spinner /> : "Refresh"}
    </Button>
  );
};

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
