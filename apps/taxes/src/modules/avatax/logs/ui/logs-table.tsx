import { SemanticChip } from "@saleor/apps-ui";
import { Accordion, Box, Divider, Text } from "@saleor/macaw-ui/next";
import { AvataxLog } from "../avatax-client-logger";

function formatDateToLocaleString(date: string) {
  return new Date(date).toLocaleDateString();
}

type SemanticChipProps = Parameters<typeof SemanticChip>[0];

const chipVariantMap: Record<AvataxLog["status"], SemanticChipProps["variant"]> = {
  success: "success",
  error: "error",
};

const StatusCell = ({ status }: { status: AvataxLog["status"] }) => {
  return <SemanticChip variant={chipVariantMap[status]}>{status}</SemanticChip>;
};

const LogRow = ({ log }: { log: AvataxLog }) => {
  const formattedDate = formatDateToLocaleString(log.date);

  return (
    <>
      <Text>{log.event}</Text>
      <StatusCell status={log.status} />
      <Text variant="caption">{formattedDate}</Text>
    </>
  );
};

const LogAccordion = ({ log }: { log: AvataxLog }) => {
  if (log.payload) {
    const prettyPayload = JSON.stringify(JSON.parse(log.payload), null, 2);

    return (
      <Accordion>
        <Accordion.Item value={log.date}>
          <Accordion.Trigger>
            <LogRow log={log} />
            <Accordion.TriggerButton />
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

export const LogsTable = ({ logs }: { logs: AvataxLog[] }) => {
  return (
    <>
      {logs.map((log, index, array) => {
        const isLast = index === array.length - 1;

        return (
          <>
            <LogAccordion key={log.date} log={log} />
            {!isLast && <Divider marginY={4} />}
          </>
        );
      })}
    </>
  );
};
