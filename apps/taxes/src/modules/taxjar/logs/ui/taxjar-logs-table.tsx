import { SemanticChip } from "@saleor/apps-ui";
import { Accordion, Box, Button, Divider, Text } from "@saleor/macaw-ui/next";
import { useRouter } from "next/router";
import { z } from "zod";
import { trpcClient } from "../../../trpc/trpc-client";
import { Table } from "../../../ui/table";
import { TaxJarLog } from "../taxjar-client-logger";

type SemanticChipProps = Parameters<typeof SemanticChip>[0];

const chipVariantMap: Record<TaxJarLog["status"], SemanticChipProps["variant"]> = {
  success: "success",
  error: "error",
};

const StatusCell = ({ status }: { status: TaxJarLog["status"] }) => {
  return <SemanticChip variant={chipVariantMap[status]}>{status}</SemanticChip>;
};

const LogRow = ({ log }: { log: TaxJarLog }) => {
  return (
    <>
      <Text>{log.event}</Text>
      <Box display={"flex"}>
        <StatusCell status={log.status} />
      </Box>
      <Text variant="caption">{log.date}</Text>
    </>
  );
};

const LogAccordion = ({ log }: { log: TaxJarLog }) => {
  if (log.payload) {
    const prettyPayload = JSON.stringify(JSON.parse(log.payload), null, 2);

    return (
      <Accordion>
        <Accordion.Item value={log.date}>
          <Accordion.Trigger>
            <Box
              alignItems={"center"}
              display={"grid"}
              __gridTemplateColumns={"2fr 1fr 1fr auto"}
              gap={4}
              width={"100%"}
            >
              <LogRow log={log} />
              <Box marginX={4}>
                <Accordion.TriggerButton />
              </Box>
            </Box>
          </Accordion.Trigger>
          <Accordion.Content>
            <Box display="grid">
              <Box
                padding={2}
                marginLeft={4}
                backgroundColor={"surfaceNeutralSubdued"}
                as="pre"
                overflowX="scroll"
                __whiteSpace={"pre-wrap"}
              >
                {prettyPayload}
              </Box>
            </Box>
          </Accordion.Content>
        </Accordion.Item>
      </Accordion>
    );
  }

  return (
    <Box>
      <LogRow log={log} />
    </Box>
  );
};

export const RefreshLogsButton = () => {
  const router = useRouter();
  const { id } = router.query;
  const configurationId = z.string().parse(id ?? "");

  const { refetch } = trpcClient.taxjarClientLogs.getAll.useQuery({
    id: configurationId,
  });

  return (
    <Button variant="secondary" size="small" onClick={() => refetch()}>
      Refresh
    </Button>
  );
};

export const TaxJarLogsTable = () => {
  const router = useRouter();
  const { id } = router.query;
  const configurationId = z.string().parse(id ?? "");

  const {
    data: logs = [],
    isFetched,
    isLoading,
  } = trpcClient.taxjarClientLogs.getAll.useQuery({
    id: configurationId,
  });
  const isEmpty = isFetched && logs.length === 0;

  return (
    <Box marginTop={10}>
      {logs.map((log, index, array) => {
        const isLast = index === array.length - 1;

        return (
          <>
            <LogAccordion key={log.date} log={log} />
            {!isLast && <Divider marginY={4} />}
          </>
        );
      })}
      {isEmpty && (
        <Box
          display={"flex"}
          flexDirection={"column"}
          justifyContent={"center"}
          alignItems={"center"}
          gap={4}
          __minHeight={"160px"}
        >
          <Text color="textNeutralSubdued" variant="bodyEmp">
            No logs found for this configuration
          </Text>
          <RefreshLogsButton />
        </Box>
      )}
      {isLoading && <Table.Skeleton />}
    </Box>
  );
};
