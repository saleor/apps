import { useAppBridge } from "@saleor/app-sdk/app-bridge";
import { useDashboardNotification } from "@saleor/apps-shared/use-dashboard-notification";
import { Box, Button, Text } from "@saleor/macaw-ui";
import { NextPage } from "next";
import { useRouter } from "next/router";

import { trpcClient } from "@/modules/trpc/trpc-client";
import type { ImportJob } from "@/types/import-types";
import { DataTable, InlineSpinner, ProgressBar, StatBox, StatusBadge } from "@/ui/components";

const STATUS_ICON: Record<string, string> = {
  pass: "\u2713",
  fail: "\u2717",
  warn: "\u26A0",
};

const STATUS_COLOR: Record<string, string> = {
  pass: "success1",
  fail: "critical1",
  warn: "info1",
};

const IndexPage: NextPage = () => {
  const { appBridgeState } = useAppBridge();
  const router = useRouter();
  const { notifySuccess, notifyError } = useDashboardNotification();

  const readiness = trpcClient.system.readiness.useQuery(undefined, {
    enabled: !!appBridgeState?.ready,
  });

  const catalog = trpcClient.catalog.summary.useQuery(undefined, {
    enabled: !!appBridgeState?.ready,
  });

  const setupAttributes = trpcClient.system.setupAttributes.useMutation({
    onSuccess: (data) => {
      notifySuccess("Attributes created", data.message);
      readiness.refetch();
    },
    onError: (error) => {
      notifyError("Failed to create attributes", error.message);
    },
  });

  const attributeCheckFailed =
    readiness.data?.checks.some(
      (check) => check.name === "attributes" && check.status === "fail"
    ) ?? false;

  const productTypeExists =
    readiness.data?.checks.some(
      (check) => check.name === "product-type" && check.status === "pass"
    ) ?? false;

  return (
    <Box>
      <Box marginBottom={6}>
        <Text as="h1" size={10} fontWeight="bold">
          Dashboard
        </Text>
      </Box>

      {/* System Readiness */}
      <Box
        padding={4}
        borderRadius={4}
        borderWidth={1}
        borderStyle="solid"
        borderColor="default1"
      >
        <Text size={5} fontWeight="bold" marginBottom={4}>
          System Readiness
        </Text>
          {readiness.isLoading && <InlineSpinner label="Checking system readiness..." />}
          {readiness.error && (
            <Box padding={4}>
              <Text color="critical1">Error: {readiness.error.message}</Text>
            </Box>
          )}
          {readiness.data && (
            <Box>
              <Box
                display="flex"
                alignItems="center"
                gap={3}
                marginBottom={4}
                padding={3}
                borderRadius={2}
                backgroundColor={readiness.data.ready ? "success1" : "critical1"}
              >
                <Text fontWeight="bold" size={4}>
                  {readiness.data.ready ? "System Ready" : "System Not Ready"}
                </Text>
              </Box>

              <Box display="flex" flexDirection="column" gap={2}>
                {readiness.data.checks.map((check) => (
                  <Box
                    key={check.name}
                    display="flex"
                    alignItems="center"
                    gap={3}
                    padding={2}
                    borderRadius={2}
                  >
                    {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                    <Text size={4} color={STATUS_COLOR[check.status] as any}>
                      {STATUS_ICON[check.status]}
                    </Text>
                    <Box __flex="1">
                      <Text fontWeight="bold">{check.name}</Text>
                      <Text size={1} color="default2">
                        {check.message}
                      </Text>
                      {check.detail && (
                        <Text size={1} color="default2">
                          {check.detail}
                        </Text>
                      )}
                    </Box>
                  </Box>
                ))}
              </Box>

              {!readiness.data.ready && (
                <Box display="flex" gap={3} marginTop={4}>
                  <Button variant="secondary" onClick={() => readiness.refetch()}>
                    Re-check
                  </Button>
                  {attributeCheckFailed && productTypeExists && (
                    <Button
                      variant="primary"
                      onClick={() => setupAttributes.mutate()}
                      disabled={setupAttributes.isLoading}
                    >
                      {setupAttributes.isLoading ? (
                        <InlineSpinner label="Creating attributes..." />
                      ) : (
                        "Create Missing Attributes"
                      )}
                    </Button>
                  )}
                </Box>
              )}
            </Box>
          )}
      </Box>

      {/* Catalog Health */}
      <Box marginTop={6}>
        <Box
          padding={4}
          borderRadius={4}
          borderWidth={1}
          borderStyle="solid"
          borderColor="default1"
        >
          <Text size={5} fontWeight="bold" marginBottom={4}>
            Catalog Health
          </Text>
            {catalog.isLoading && <InlineSpinner label="Loading catalog data..." />}
            {catalog.error && (
              <Box padding={4}>
                <Text color="critical1">Error: {catalog.error.message}</Text>
              </Box>
            )}
            {catalog.data && (
              <Box>
                <Box display="flex" gap={6} flexWrap="wrap" marginBottom={4}>
                  <StatBox label="Sets Imported" value={String(catalog.data.totalSets)} />
                  <StatBox label="Complete Sets" value={String(catalog.data.completeSets)} />
                  <StatBox
                    label="Incomplete Sets"
                    value={String(catalog.data.incompleteSets)}
                    color={catalog.data.incompleteSets > 0 ? "critical1" : "success1"}
                  />
                  <StatBox label="Cards Imported" value={String(catalog.data.totalCards)} />
                  <StatBox label="Cards Expected" value={String(catalog.data.totalExpected)} />
                  <StatBox
                    label="Completeness"
                    value={`${catalog.data.completenessPercent}%`}
                    color={catalog.data.completenessPercent >= 100 ? "success1" : "info1"}
                  />
                  <StatBox label="Products in Saleor" value={String(catalog.data.totalProducts)} />
                  <StatBox label="Total Jobs Run" value={String(catalog.data.totalJobs)} />
                </Box>

                {/* Completeness Bar */}
                {catalog.data.totalExpected > 0 && (
                  <Box marginBottom={4}>
                    <ProgressBar
                      percent={catalog.data.completenessPercent}
                      showLabel
                      label="Overall Completeness"
                    />
                  </Box>
                )}

                {/* Recent Jobs */}
                {catalog.data.recentJobs.length > 0 && (
                  <Box>
                    <Text as="p" fontWeight="bold" marginBottom={2}>
                      Recent Jobs
                    </Text>
                    <DataTable
                      columns={[
                        {
                          header: "Type",
                          render: (job: ImportJob) => <Text size={1}>{job.type}</Text>,
                        },
                        {
                          header: "Set",
                          render: (job: ImportJob) => (
                            <Text size={1}>{job.setCode?.toUpperCase() ?? "ALL"}</Text>
                          ),
                        },
                        {
                          header: "Status",
                          render: (job: ImportJob) => <StatusBadge status={job.status} />,
                        },
                        {
                          header: "Cards",
                          align: "right",
                          render: (job: ImportJob) => (
                            <Text size={1}>
                              {job.cardsProcessed}/{job.cardsTotal || "?"}
                            </Text>
                          ),
                        },
                        {
                          header: "Created",
                          render: (job: ImportJob) => (
                            <Text size={1}>
                              {new Date(job.createdAt).toLocaleDateString()}
                            </Text>
                          ),
                        },
                      ]}
                      data={catalog.data.recentJobs as unknown as ImportJob[]}
                      rowKey={(job) => job.id}
                      onRowClick={(job) => router.push(`/import/${job.id}`)}
                    />
                  </Box>
                )}

                {/* Quick Actions */}
                <Box display="flex" gap={3} marginTop={4}>
                  <Button onClick={() => router.push("/import/new")}>
                    New Import
                  </Button>
                  <Button variant="secondary" onClick={() => router.push("/sets")}>
                    Browse Sets
                  </Button>
                  <Button variant="secondary" onClick={() => router.push("/import")}>
                    View All Jobs
                  </Button>
                </Box>
              </Box>
            )}
        </Box>
      </Box>
    </Box>
  );
};

export default IndexPage;
