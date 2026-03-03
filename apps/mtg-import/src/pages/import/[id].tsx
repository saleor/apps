import { useDashboardNotification } from "@saleor/apps-shared/use-dashboard-notification";
import { Breadcrumbs } from "@saleor/apps-ui";
import { Box, Button, Text } from "@saleor/macaw-ui";
import { NextPage } from "next";
import Link from "next/link";
import { useRouter } from "next/router";

import { trpcClient } from "@/modules/trpc/trpc-client";
import type { ImportJobWithProducts } from "@/types/import-types";
import {
  DataTable,
  InlineSpinner,
  ProgressBar,
  StatBox,
  StatusBadge,
} from "@/ui/components";

const JobDetailPage: NextPage = () => {
  const router = useRouter();
  const jobId = router.query.id as string;
  const utils = trpcClient.useUtils();
  const { notifySuccess, notifyError } = useDashboardNotification();

  const { data: job, isLoading, error } = trpcClient.jobs.get.useQuery(
    { id: jobId },
    { enabled: !!jobId, refetchInterval: 3000 }
  );

  const cancelMutation = trpcClient.jobs.cancel.useMutation({
    onSuccess: () => {
      utils.jobs.get.invalidate({ id: jobId });
      notifySuccess("Job cancelled", "The import job has been cancelled.");
    },
    onError: (err) => notifyError("Cancel failed", err.message),
  });

  const retryMutation = trpcClient.jobs.retry.useMutation({
    onSuccess: (newJob) => {
      notifySuccess("Retry created", "A new retry job has been created.");
      router.push(`/import/${newJob.id}`);
    },
    onError: (err) => notifyError("Retry failed", err.message),
  });

  if (error) {
    return <Text color="critical1">Error: {error.message}</Text>;
  }

  if (isLoading || !job) {
    return <InlineSpinner label="Loading job details..." />;
  }

  const j = job as unknown as ImportJobWithProducts;

  const progressPercent = j.cardsTotal > 0
    ? Math.round((j.cardsProcessed / j.cardsTotal) * 100)
    : 0;

  // ETA calculation
  let etaText: string | null = null;
  if (j.status === "RUNNING" && j.startedAt && j.cardsProcessed > 0 && j.cardsTotal > 0) {
    const elapsedMs = Date.now() - new Date(j.startedAt).getTime();
    const cardsPerMs = j.cardsProcessed / elapsedMs;
    const remainingCards = j.cardsTotal - j.cardsProcessed;
    const remainingMs = remainingCards / cardsPerMs;

    if (remainingMs < 60_000) {
      etaText = "< 1 minute remaining";
    } else if (remainingMs < 3_600_000) {
      const mins = Math.ceil(remainingMs / 60_000);
      etaText = `~${mins} minute${mins > 1 ? "s" : ""} remaining`;
    } else {
      const hours = Math.floor(remainingMs / 3_600_000);
      const mins = Math.ceil((remainingMs % 3_600_000) / 60_000);
      etaText = `~${hours}h ${mins}m remaining`;
    }
  }

  const errorLog: string[] = j.errorLog ? JSON.parse(j.errorLog) : [];

  return (
    <Box>
      <Box marginBottom={4}>
        <Breadcrumbs>
          <Breadcrumbs.Item>
            <Link href="/import">Import Jobs</Link>
          </Breadcrumbs.Item>
          <Breadcrumbs.Item>
            {j.type} {j.setCode ? `(${j.setCode.toUpperCase()})` : ""}
          </Breadcrumbs.Item>
        </Breadcrumbs>
      </Box>

      <Box display="flex" justifyContent="space-between" alignItems="center" marginBottom={6}>
        <Text as="h1" size={10} fontWeight="bold">
          {j.type} Import {j.setCode ? `(${j.setCode.toUpperCase()})` : ""}
        </Text>
        <Box display="flex" gap={2}>
          {(j.status === "RUNNING" || j.status === "PENDING") && (
            <Button
              variant="secondary"
              onClick={() => cancelMutation.mutate({ id: j.id })}
            >
              Cancel
            </Button>
          )}
          {(j.status === "FAILED" || j.status === "CANCELLED") && (
            <Button onClick={() => retryMutation.mutate({ id: j.id })}>
              Retry
            </Button>
          )}
        </Box>
      </Box>

      {/* Stats */}
      <Box
        padding={4}
        borderRadius={4}
        borderWidth={1}
        borderStyle="solid"
        borderColor="default1"
      >
        <Text size={5} fontWeight="bold" marginBottom={4}>
          Job Status
        </Text>
          <Box display="flex" gap={6} flexWrap="wrap" alignItems="center">
            <Box>
              <Text size={1} color="default2">Status</Text>
              <Box marginTop={1}>
                <StatusBadge status={j.status} />
              </Box>
            </Box>
            <StatBox label="Priority" value={String(j.priority)} />
            <StatBox label="Cards Processed" value={String(j.cardsProcessed)} />
            <StatBox label="Cards Total" value={String(j.cardsTotal || "\u2014")} />
            <StatBox label="Variants Created" value={String(j.variantsCreated)} />
            <StatBox label="Already Existed" value={j.skipped > 0 ? String(j.skipped) : "\u2014"} />
            <StatBox label="Errors" value={String(j.errors)} />
          </Box>

          {/* Progress Bar */}
          {j.status === "RUNNING" && j.cardsTotal > 0 && (
            <Box padding={4} paddingTop={0}>
              <ProgressBar
                percent={progressPercent}
                showLabel
                sublabel={etaText ?? undefined}
              />
            </Box>
          )}

          {/* Timestamps */}
          <Box display="flex" gap={6} padding={4} paddingTop={0}>
            <StatBox label="Created" value={formatDate(j.createdAt)} />
            {j.startedAt && <StatBox label="Started" value={formatDate(j.startedAt)} />}
            {j.completedAt && <StatBox label="Completed" value={formatDate(j.completedAt)} />}
          </Box>
      </Box>

      {/* Error Log */}
      {(j.errorMessage || errorLog.length > 0) && (
        <Box marginTop={6}>
          <Box
            padding={4}
            borderRadius={4}
            borderWidth={1}
            borderStyle="solid"
            borderColor="default1"
          >
            <Text size={5} fontWeight="bold" marginBottom={4}>
              Errors
            </Text>
                {j.errorMessage && (
                  <Box marginBottom={4} padding={3} backgroundColor="critical1" borderRadius={2}>
                    <Text>{j.errorMessage}</Text>
                  </Box>
                )}
                {errorLog.length > 0 && (
                  <Box
                    as="pre"
                    padding={3}
                    backgroundColor="default1"
                    borderRadius={2}
                    style={{ overflow: "auto", maxHeight: "400px", fontSize: "12px", fontFamily: "monospace" }}
                  >
                    {errorLog.map((line, i) => (
                      <Box key={i}>
                        <Text size={1}>{line}</Text>
                      </Box>
                    ))}
                  </Box>
                )}
          </Box>
        </Box>
      )}

      {/* Recent Imports */}
      {j.importedProducts && j.importedProducts.length > 0 && (
        <Box marginTop={6}>
          <Box
            padding={4}
            borderRadius={4}
            borderWidth={1}
            borderStyle="solid"
            borderColor="default1"
          >
            <Text size={5} fontWeight="bold" marginBottom={4}>
              {`Recent Imports (${j._count?.importedProducts ?? 0} total)`}
            </Text>
              <DataTable
                columns={[
                  {
                    header: "Card",
                    render: (p) => <Text>{p.cardName}</Text>,
                  },
                  {
                    header: "Set",
                    render: (p) => (
                      <Text>
                        {p.setCode.toUpperCase()} #{p.collectorNumber}
                      </Text>
                    ),
                  },
                  {
                    header: "Rarity",
                    render: (p) => <Text>{p.rarity}</Text>,
                  },
                  {
                    header: "Variants",
                    align: "right",
                    render: (p) => <Text>{p.variantCount}</Text>,
                  },
                  {
                    header: "Status",
                    render: (p) => (
                      <Text color={p.success ? "success1" : "critical1"}>
                        {p.success ? "OK" : p.errorMessage ?? "Failed"}
                      </Text>
                    ),
                  },
                ]}
                data={j.importedProducts}
                rowKey={(p) => p.id}
              />
          </Box>
        </Box>
      )}
    </Box>
  );
};

function formatDate(date: Date | string): string {
  return new Date(date).toLocaleString();
}

export default JobDetailPage;
