import { Box, Input, RangeInput, Switch, Text } from "@saleor/macaw-ui";
import { useState } from "react";

import { type ClientLogValue } from "@/modules/client-logs/client-log";
import { trpcClient } from "@/modules/trpc/trpc-client";

type LogsTypeSwitchState = "date" | "psp";

const formatUserFriendlyDate = (date: Date) => {
  const lang = navigator.language ?? "en-GB";

  return Intl.DateTimeFormat(lang, {
    day: "numeric",
    month: "numeric",
    year: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  }).format(date);
};

const LogsList = ({ logs }: { logs: Array<ClientLogValue> }) => {
  return (
    <Box as="table" verticalAlign="middle">
      <tbody>
        <Box as={"tr"}>
          <th>
            <Text size={2} color={"default2"}>
              Date
            </Text>
          </th>
          <th>
            <Text size={2} color={"default2"}>
              Message and entity ID
            </Text>
          </th>
          <th>
            <Text size={2} color={"default2"}>
              Additional attributes
            </Text>
          </th>
        </Box>
        {logs.map((log) => (
          <Box
            borderBottomWidth={1}
            borderBottomStyle={"solid"}
            borderColor={"default1"}
            as="tr"
            key={log.id}
            textAlign="left"
          >
            <th>
              <Text lineHeight={8} size={1}>
                {formatUserFriendlyDate(new Date(log.date))}
              </Text>
            </th>
            <th>
              <Text size={2} as={"p"}>
                {log.message}
              </Text>
              <Text size={1}>
                <code>{log.checkoutOrOrderId}</code>
              </Text>
            </th>
            <th>
              <Text size={1}>
                <code>
                  <pre>{JSON.stringify(log.attributes, null, 2)}</pre>
                </code>
              </Text>
            </th>
          </Box>
        ))}
      </tbody>
    </Box>
  );
};

/**
 * Format date for format yyyy-mm-dd T hh:mm
 */
const formatDateForInput = (d: Date) => {
  const pad = (n: number) => n.toString().padStart(2, "0");

  const yyyy = d.getFullYear();
  const MM = pad(d.getMonth() + 1);
  const hh = pad(d.getHours());
  const mm = pad(d.getMinutes());

  return `${yyyy}-${MM}-${pad(d.getDate())}T${hh}:${mm}`;
};

// TODO: Pagination
const LogsByDate = () => {
  const [rangeDates, setRangeDates] = useState<{ start: Date; end: Date }>(() => {
    const now = Date.now();
    const anHour = 60 * 60 * 1000;
    const hourFromNow = now - anHour;

    return {
      end: new Date(now),
      start: new Date(hourFromNow),
    };
  });

  const { data: logs, error } = trpcClient.clientLogs.getByDate.useQuery({
    startDate: rangeDates.start.toISOString(),
    endDate: rangeDates.end.toISOString(),
  });

  return (
    <Box>
      <Box alignItems="center" display="flex" flexWrap="wrap" gap={0.5} marginBottom={4}>
        <RangeInput
          onChange={(values) => {
            const [start, end] = values;

            setRangeDates({
              start: new Date(start),
              end: new Date(end),
            });
          }}
          size="large"
          type="datetime-local"
          value={[formatDateForInput(rangeDates.start), formatDateForInput(rangeDates.end)]}
        />
      </Box>
      {error && <Text color="critical1">{error.message}</Text>}
      {logs && logs.length ? (
        <LogsList logs={logs} />
      ) : (
        "No logs are available for specified date range"
      )}
    </Box>
  );
};

const LogsByCheckoutOrOrderId = () => {
  const [query, setQuery] = useState<string | null>(null);
  const {
    data: logs,
    error,
    isLoading,
  } = trpcClient.clientLogs.getByCheckoutOrOrderId.useQuery(
    { checkoutOrOrderId: query ?? "" }, // Set default to empty string, for typescript - but this will not be called
    { enabled: !!query },
  );

  return (
    <Box>
      <Box alignItems="center" display="flex" flexWrap="wrap" gap={0.5} marginBottom={4}>
        <Input
          width={"100%"}
          label="Order or checkout ID"
          onChange={(event) => {
            setQuery(event.target.value);
          }}
          size="large"
          value={query ?? ""}
        />
      </Box>
      {error && <Text color="critical1">{error.message}</Text>}
      {logs && logs.length ? (
        <LogsList logs={logs} />
      ) : query && !isLoading ? (
        "No logs are available for specified ID"
      ) : null}
    </Box>
  );
};

export const LogsBrowser = () => {
  const [queryType, setQueryType] = useState<LogsTypeSwitchState>("date");

  const activeView = queryType === "date" ? <LogsByDate /> : <LogsByCheckoutOrOrderId />;

  return (
    <Box>
      <Box display={"inline-block"}>
        <Switch
          defaultValue={queryType}
          onValueChange={(value) => {
            setQueryType(value as LogsTypeSwitchState);
          }}
        >
          <Switch.Item id="logs-browser-date" value="date">
            <Text>Query by date</Text>
          </Switch.Item>
          <Switch.Item id="logs-browser-psp" value="psp">
            <Text>Query by Order or Checkout ID</Text>
          </Switch.Item>
        </Switch>
      </Box>
      <Box paddingTop={8}>{activeView}</Box>
    </Box>
  );
};
