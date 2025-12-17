import {
  Box,
  Button,
  ChevronLeftIcon,
  ChevronRightIcon,
  Input,
  RangeInput,
  Skeleton,
  Switch,
  Text,
} from "@saleor/macaw-ui";
import { useState } from "react";

import { type ClientLogValue } from "@/modules/client-logs/client-log";
import { trpcClient } from "@/modules/trpc/trpc-client";

import { formatDateForInput, formatDateForQuery, formatUserFriendlyDate } from "./format-date";
import { useClientLogsPagination } from "./use-client-logs-pagination";

type LogsTypeSwitchState = "date" | "orderOrCheckoutID";

const LogsSkeleton = () => {
  const count = 3;

  return (
    <Box>
      {new Array(count).fill(null).map((_v, i) => {
        return <Skeleton key={i} height={20} marginBottom={4} />;
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

const LogsPagiation = ({
  onForwardButtonClick,
  onBackwardButtonClick,
  isForwardButtonDisabled,
  isBackwardButtonDisabled,
}: {
  onForwardButtonClick: () => void;
  onBackwardButtonClick: () => void;
  isForwardButtonDisabled: boolean;
  isBackwardButtonDisabled: boolean;
}) => {
  return (
    <Box display="flex" marginTop={4} justifyContent="flex-end">
      <Box display="flex" gap={2}>
        <Button
          onClick={onBackwardButtonClick}
          disabled={isBackwardButtonDisabled}
          icon={<ChevronLeftIcon />}
          variant="secondary"
        />
        <Button
          onClick={onForwardButtonClick}
          disabled={isForwardButtonDisabled}
          icon={<ChevronRightIcon />}
          variant="secondary"
        />
      </Box>
    </Box>
  );
};

const LogsByDate = () => {
  const {
    currentEvaluatedKey,
    goToNextEvaluatedKey,
    goToPreviousEvaluatedKey,
    isNextButtonDisabled,
    isPreviousButtonDisabled,
  } = useClientLogsPagination();

  const [rangeDates, setRangeDates] = useState<{ start: Date; end: Date }>(() => {
    const now = Date.now();
    const anHour = 60 * 60 * 1000;
    const hourFromNow = now - anHour;

    return {
      end: new Date(now),
      start: new Date(hourFromNow),
    };
  });

  const { data, error, isLoading } = trpcClient.clientLogs.getByDate.useQuery({
    startDate: formatDateForQuery(rangeDates.start),
    endDate: formatDateForQuery(rangeDates.end),
    lastEvaluatedKey: currentEvaluatedKey,
  });

  const isEmpty = !isLoading && data?.clientLogs && data.clientLogs.length === 0;
  const isLoaded = !isLoading && data?.clientLogs && data.clientLogs.length > 0;
  const logs = (data?.clientLogs ?? []) as unknown as Array<ClientLogValue>;

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
      <LogsPagiation
        onForwardButtonClick={() => goToNextEvaluatedKey(data?.lastEvaluatedKey)}
        onBackwardButtonClick={() => goToPreviousEvaluatedKey()}
        isForwardButtonDisabled={isNextButtonDisabled(data?.lastEvaluatedKey)}
        isBackwardButtonDisabled={isPreviousButtonDisabled()}
      />
    </Box>
  );
};

const LogsByCheckoutOrOrderId = () => {
  const {
    currentEvaluatedKey,
    goToNextEvaluatedKey,
    goToPreviousEvaluatedKey,
    isNextButtonDisabled,
    isPreviousButtonDisabled,
  } = useClientLogsPagination();
  const [query, setQuery] = useState<string | null>(null);
  const { data, error, isLoading } = trpcClient.clientLogs.getByCheckoutOrOrderId.useQuery(
    { checkoutOrOrderId: query ?? "" }, // Set default to empty string, for typescript - but this will not be called
    { enabled: !!query },
  );

  const isEmpty = !isLoading && data?.clientLogs && data.clientLogs.length === 0;
  const isLoaded = !isLoading && data?.clientLogs && data.clientLogs.length > 0;
  const logs = (data?.clientLogs ?? []) as unknown as Array<ClientLogValue>;

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
      <LogsPagiation
        onForwardButtonClick={() => goToNextEvaluatedKey(data?.lastEvaluatedKey)}
        onBackwardButtonClick={() => goToPreviousEvaluatedKey()}
        isForwardButtonDisabled={isNextButtonDisabled(data?.lastEvaluatedKey)}
        isBackwardButtonDisabled={isPreviousButtonDisabled()}
      />
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
