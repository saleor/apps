import { Box, Input, RangeInput, Skeleton, Switch, Text } from "@saleor/macaw-ui";
import { useState } from "react";

import { type ClientLogValue } from "@/modules/client-logs/client-log";
import { trpcClient } from "@/modules/trpc/trpc-client";

type LogsTypeSwitchState = "date" | "orderOrCheckoutID";

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

const LogsSkeleton = () => {
  const count = 3;

  return (
    <Box>
      {new Array(count).fill(null).map((index) => {
        return <Skeleton height={20} marginBottom={4} />;
      })}
    </Box>
  );
};

const LogsList = ({ logs }: { logs: Array<ClientLogValue> }) => {
  return (
    <Box>
      {logs.map((log) => (
        <Box
          borderBottomWidth={1}
          borderBottomStyle={"solid"}
          borderColor={"default1"}
          display="flex"
          key={log.id}
          textAlign="left"
          padding={4}
          alignItems="center"
        >
          <Box marginRight={4} __width="150px">
            <Text lineHeight={8} size={1}>
              {formatUserFriendlyDate(new Date(log.date))}
            </Text>
          </Box>
          <Box>
            <Text
              fontWeight="bold"
              size={2}
              as={"p"}
              color={log.level === "error" ? "critical1" : "default1"}
            >
              {log.message}
            </Text>
            <Text size={1}>
              {log.checkoutOrOrder} ID: {log.checkoutOrOrderId}
            </Text>
          </Box>
          {Object.keys(log.attributes).length > 0 ? (
            <Box marginLeft="auto" __width="400px">
              <Text size={1} display={"block"}>
                <Box as="code" width={"100%"}>
                  <pre>{JSON.stringify(log.attributes, null, 2)}</pre>
                </Box>
              </Text>
            </Box>
          ) : null}
        </Box>
      ))}
    </Box>
  );
};

/**
 * Format date for format yyyy-mm-dd T hh:mm -> required by RangePicker
 */
const formatDateForInput = (d: Date) => {
  const pad = (n: number) => n.toString().padStart(2, "0");

  const yyyy = d.getFullYear();
  const MM = pad(d.getMonth() + 1);
  const hh = pad(d.getHours());
  const mm = pad(d.getMinutes());

  return `${yyyy}-${MM}-${pad(d.getDate())}T${hh}:${mm}`;
};

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

  const {
    data: logs,
    error,
    isLoading,
  } = trpcClient.clientLogs.getByDate.useQuery({
    startDate: rangeDates.start.toISOString(),
    endDate: rangeDates.end.toISOString(),
  });

  const isEmpty = !isLoading && logs && logs.length === 0;
  const isLoaded = !isLoading && logs && logs.length > 0;

  return (
    <Box>
      <Box alignItems="center" display="flex" flexWrap="wrap" gap={0.5} marginBottom={4}>
        <Text marginRight={2}>From</Text>
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
        >
          <Text marginX={2}>To</Text>
        </RangeInput>
      </Box>
      {error && <Text color="critical1">{error.message}</Text>}
      {isEmpty && <Text>No logs are available for specified date range</Text>}
      {isLoaded && <LogsList logs={logs} />}
      {isLoading && <LogsSkeleton />}
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

  const isEmpty = !isLoading && logs && logs.length === 0;
  const isLoaded = !isLoading && logs && logs.length > 0;

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
      {isEmpty && <Text>No logs are available for the specified ID</Text>}
      {isLoaded && <LogsList logs={logs} />}
      {isLoading && query && <LogsSkeleton />}
      {!query && <Text>Enter Checkout or Order ID and wait for results</Text>}
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
          <Switch.Item id="logs-browser-orderOrCheckoutID" value="orderOrCheckoutID">
            <Text>Query by Order or Checkout ID</Text>
          </Switch.Item>
        </Switch>
      </Box>
      <Box paddingTop={8}>{activeView}</Box>
    </Box>
  );
};
