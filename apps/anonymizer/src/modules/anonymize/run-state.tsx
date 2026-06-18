import { TextLink } from "@saleor/apps-ui";
import { Box, Text } from "@saleor/macaw-ui";

export type Failure = {
  id: string;
  label: string;
  /**
   * When set, the failure renders as a link to the record in the Dashboard.
   * Records without a Dashboard detail page (e.g. checkouts) omit it and render
   * as plain text instead.
   */
  dashboardPath?: string;
};

export type RunState = {
  running: boolean;
  done: number;
  total: number;
  failures: Failure[];
  /** Set after the run finished, so the summary stays visible. */
  finishedSummary: string | null;
};

export const idleRun: RunState = {
  running: false,
  done: 0,
  total: 0,
  failures: [],
  finishedSummary: null,
};

export const RunProgress = ({ run, label }: { run: RunState; label: string }) => {
  if (!run.running) {
    return null;
  }

  return (
    <Box display="flex" flexDirection="column" gap={1} width="100%">
      <progress value={run.done} max={run.total} aria-label={label} style={{ width: "100%" }} />
      <Text size={2}>{`${run.done} / ${run.total}`}</Text>
    </Box>
  );
};

export const RunResult = ({ run }: { run: RunState }) => {
  if (run.running || !run.finishedSummary) {
    return null;
  }

  return (
    <Box display="flex" flexDirection="column" gap={1}>
      <Text color={run.failures.length ? "critical1" : "default1"}>{run.finishedSummary}</Text>
      {run.failures.length > 0 && (
        <Box as="ul" margin={0} display="flex" flexDirection="column" gap={0.5}>
          {run.failures.map((failure) => (
            <li key={failure.id}>
              {failure.dashboardPath ? (
                <TextLink href={failure.dashboardPath} newTab>
                  {failure.label}
                </TextLink>
              ) : (
                <Text>{failure.label}</Text>
              )}
            </li>
          ))}
        </Box>
      )}
    </Box>
  );
};
