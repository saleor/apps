import { useDashboardNotification } from "@saleor/apps-shared/use-dashboard-notification";
import { Box, Button, Text } from "@saleor/macaw-ui";
import { NextPage } from "next";
import { useRouter } from "next/router";

import { trpcClient } from "@/modules/trpc/trpc-client";
import type { ImportJob } from "@/types/import-types";
import {
  DataTable,
  InlineSpinner,
  ProgressBar,
  StatusBadge,
  TableSkeleton,
} from "@/ui/components";

const ImportJobsPage: NextPage = () => {
  const router = useRouter();
  const utils = trpcClient.useUtils();
  const { notifySuccess, notifyError } = useDashboardNotification();

  const { data, isLoading, error } = trpcClient.jobs.list.useQuery(
    {},
    { refetchInterval: 5000 }
  );

  const cancelMutation = trpcClient.jobs.cancel.useMutation({
    onSuccess: () => {
      utils.jobs.list.invalidate();
      notifySuccess("Job cancelled", "The import job has been cancelled.");
    },
    onError: (err) => notifyError("Cancel failed", err.message),
  });

  const retryMutation = trpcClient.jobs.retry.useMutation({
    onSuccess: () => {
      utils.jobs.list.invalidate();
      notifySuccess("Job retried", "A new retry job has been created.");
    },
    onError: (err) => notifyError("Retry failed", err.message),
  });

  if (error) {
    return (
      <Box>
        <Text color="critical1">Error: {error.message}</Text>
      </Box>
    );
  }

  const jobs = (data?.jobs ?? []) as unknown as ImportJob[];

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" marginBottom={6}>
        <Text as="h1" size={10} fontWeight="bold">
          Import Jobs
        </Text>
        <Button onClick={() => router.push("/import/new")}>New Import</Button>
      </Box>

      <Box
        padding={4}
        borderRadius={4}
        borderWidth={1}
        borderStyle="solid"
        borderColor="default1"
      >
        <Text size={5} fontWeight="bold" marginBottom={4}>
          Job Queue
        </Text>
        {isLoading ? (
          <TableSkeleton rows={5} />
        ) : jobs.length === 0 ? (
            <Box padding={6} display="flex" flexDirection="column" alignItems="center" gap={4}>
              <Text color="default2">No import jobs yet.</Text>
              <Button onClick={() => router.push("/import/new")}>Start your first import</Button>
            </Box>
        ) : (
            <DataTable
              columns={[
                {
                  header: "Type",
                  render: (job: ImportJob) => <Text>{job.type}</Text>,
                },
                {
                  header: "Set",
                  render: (job: ImportJob) => (
                    <Text>{job.setCode?.toUpperCase() ?? "All"}</Text>
                  ),
                },
                {
                  header: "Status",
                  render: (job: ImportJob) => <StatusBadge status={job.status} />,
                },
                {
                  header: "Progress",
                  align: "right",
                  render: (job: ImportJob) => (
                    <Box>
                      <Text>
                        {job.cardsProcessed}
                        {job.cardsTotal > 0 ? ` / ${job.cardsTotal}` : ""}
                      </Text>
                      {job.status === "RUNNING" && job.cardsTotal > 0 && (
                        <Box marginTop={1}>
                          <ProgressBar
                            percent={Math.round(
                              (job.cardsProcessed / job.cardsTotal) * 100
                            )}
                            height="4px"
                          />
                        </Box>
                      )}
                    </Box>
                  ),
                },
                {
                  header: "Skipped",
                  align: "right",
                  render: (job: ImportJob) => (
                    <Text color={job.skipped > 0 ? "default2" : undefined}>
                      {job.skipped > 0 ? job.skipped : "\u2014"}
                    </Text>
                  ),
                },
                {
                  header: "Errors",
                  align: "right",
                  render: (job: ImportJob) => (
                    <Text color={job.errors > 0 ? "critical1" : undefined}>
                      {job.errors}
                    </Text>
                  ),
                },
                {
                  header: "Actions",
                  align: "right",
                  render: (job: ImportJob) => (
                    <Box
                      display="flex"
                      gap={2}
                      justifyContent="flex-end"
                      onClick={(e: React.MouseEvent) => e.stopPropagation()}
                    >
                      {(job.status === "RUNNING" || job.status === "PENDING") && (
                        <Button
                          size="small"
                          variant="secondary"
                          onClick={() => cancelMutation.mutate({ id: job.id })}
                        >
                          Cancel
                        </Button>
                      )}
                      {(job.status === "FAILED" || job.status === "CANCELLED") && (
                        <Button
                          size="small"
                          variant="secondary"
                          onClick={() => retryMutation.mutate({ id: job.id })}
                        >
                          Retry
                        </Button>
                      )}
                    </Box>
                  ),
                },
              ]}
              data={jobs}
              rowKey={(job) => job.id}
              onRowClick={(job) => router.push(`/import/${job.id}`)}
            />
        )}
      </Box>
    </Box>
  );
};

export default ImportJobsPage;
