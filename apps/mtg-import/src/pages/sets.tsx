import { useDashboardNotification } from "@saleor/apps-shared/use-dashboard-notification";
import { Box, Button, Input, Select, Text } from "@saleor/macaw-ui";
import { NextPage } from "next";
import { useRouter } from "next/router";
import { useState, useMemo } from "react";

import { trpcClient } from "@/modules/trpc/trpc-client";
import type { SetAudit } from "@/types/import-types";
import {
  ConfirmModal,
  DataTable,
  InlineSpinner,
  ProgressBar,
  StatBox,
  TableSkeleton,
} from "@/ui/components";

const SET_TYPE_OPTIONS = [
  { value: "all", label: "All Types" },
  { value: "core", label: "Core" },
  { value: "expansion", label: "Expansion" },
  { value: "masters", label: "Masters" },
  { value: "commander", label: "Commander" },
  { value: "draft_innovation", label: "Draft Innovation" },
  { value: "starter", label: "Starter" },
  { value: "funny", label: "Funny" },
];

const DISPLAY_LIMIT = 50;

const SetsPage: NextPage = () => {
  const router = useRouter();
  const { notifySuccess, notifyError } = useDashboardNotification();
  const { data: sets, isLoading } = trpcClient.sets.list.useQuery();
  const { data: importStatus } = trpcClient.sets.importStatus.useQuery();
  const [verifyingSet, setVerifyingSet] = useState<string | null>(null);
  const [scanningSet, setScanningSet] = useState<string | null>(null);
  const [auditingSet, setAuditingSet] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [displayLimit, setDisplayLimit] = useState(DISPLAY_LIMIT);
  const [confirmDialog, setConfirmDialog] = useState<{
    message: string;
    onConfirm: () => void;
  } | null>(null);

  const importedSets = new Map(
    ((importStatus ?? []) as unknown as SetAudit[]).map((audit) => [audit.setCode, audit])
  );

  const createMutation = trpcClient.jobs.create.useMutation({
    onSuccess: (job) => {
      notifySuccess("Import started", `Job created for set import.`);
      router.push(`/import/${job.id}`);
    },
    onError: (err) => notifyError("Import failed", err.message),
  });

  const batchMutation = trpcClient.jobs.createBatch.useMutation({
    onSuccess: () => {
      notifySuccess("Batch created", "Re-import jobs queued for all incomplete sets.");
      router.push("/import");
    },
    onError: (err) => notifyError("Batch failed", err.message),
  });

  const verifyQuery = trpcClient.sets.verify.useQuery(
    { setCode: verifyingSet ?? "" },
    { enabled: !!verifyingSet }
  );

  const scanQuery = trpcClient.sets.scan.useQuery(
    { setCode: scanningSet ?? "" },
    { enabled: !!scanningSet }
  );

  const auditQuery = trpcClient.sets.auditAttributes.useQuery(
    { setCode: auditingSet ?? "" },
    { enabled: !!auditingSet }
  );

  const repairMutation = trpcClient.sets.repairAttributes.useMutation({
    onSuccess: (data) => {
      notifySuccess("Repair complete", `${data.repaired} repaired, ${data.failed} failed.`);
      setAuditingSet(null);
    },
    onError: (err) => notifyError("Repair failed", err.message),
  });

  const backfillAttrsMutation = trpcClient.sets.backfillAttributes.useMutation({
    onSuccess: (data) => {
      notifySuccess(
        "Attrs fixed",
        `${data.productsScanned} products, ${data.variantsUpdated} variants updated, ${data.variantsSkipped} skipped.${data.errors.length > 0 ? ` ${data.errors.length} errors.` : ""}`
      );
    },
    onError: (err) => notifyError("Fix attrs failed", err.message),
  });

  const backfillAllAttrsMutation = trpcClient.sets.backfillAllAttributes.useMutation({
    onSuccess: (data) => {
      notifySuccess("Fix All Attrs started", data.message);
    },
    onError: (err) => notifyError("Fix all attrs failed", err.message),
  });

  const backfillProductAttrsMutation = trpcClient.sets.backfillProductAttributes.useMutation({
    onSuccess: (data) => {
      notifySuccess("Product Attrs Backfill started", data.message);
    },
    onError: (err) => notifyError("Product attrs backfill failed", err.message),
  });

  const rebuildAuditsMutation = trpcClient.sets.rebuildAudits.useMutation({
    onSuccess: (data) => {
      notifySuccess(
        "Audits rebuilt",
        `${data.setsCreated} created, ${data.setsUpdated} updated (${data.totalSets} total).${data.errors.length > 0 ? ` ${data.errors.length} errors.` : ""}`
      );
    },
    onError: (err) => notifyError("Rebuild audits failed", err.message),
  });

  // Filter and search sets
  const filteredSets = useMemo(() => {
    if (!sets) return [];
    let result = sets;

    if (filterType !== "all") {
      result = result.filter((s) => s.set_type === filterType);
    }

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (s) =>
          s.code.toLowerCase().includes(q) ||
          s.name.toLowerCase().includes(q)
      );
    }

    return result;
  }, [sets, searchQuery, filterType]);

  const displayedSets = filteredSets.slice(0, displayLimit);
  const totalSetsCount = sets?.length ?? 0;

  const incompleteSets = useMemo(() => {
    if (!sets) return [];
    return sets.filter((s) => {
      const audit = importedSets.get(s.code);
      if (!audit) return false;
      const completeness = audit.totalCards > 0
        ? Math.round((audit.importedCards / audit.totalCards) * 100)
        : 0;
      return completeness < 100;
    });
  }, [sets, importedSets]);

  const handleImportSet = (setCode: string, cardCount: number) => {
    if (cardCount > 500) {
      setConfirmDialog({
        message: `Import ${setCode.toUpperCase()} (${cardCount} cards)? This may take a few minutes.`,
        onConfirm: () => {
          createMutation.mutate({ type: "SET", setCode, priority: 2 });
        },
      });
    } else {
      createMutation.mutate({ type: "SET", setCode, priority: 2 });
    }
  };

  const handleBackfill = (setCode: string) => {
    createMutation.mutate({
      type: "BACKFILL",
      setCode,
      priority: 2,
    });
    setScanningSet(null);
  };

  const handleBackfillAllIncomplete = () => {
    const setCodes = incompleteSets.map((s) => s.code);
    setConfirmDialog({
      message: `Create backfill jobs for ${setCodes.length} incomplete set(s)? This will queue imports for all missing cards.`,
      onConfirm: () => {
        batchMutation.mutate({ setCodes, priority: 2 });
      },
    });
  };

  return (
    <Box>
      <ConfirmModal
        open={!!confirmDialog}
        title="Confirm Import"
        message={confirmDialog?.message ?? ""}
        confirmLabel="Start Import"
        onConfirm={() => {
          confirmDialog?.onConfirm();
          setConfirmDialog(null);
        }}
        onClose={() => setConfirmDialog(null)}
      />

      <Box display="flex" justifyContent="space-between" alignItems="center" marginBottom={6}>
        <Text as="h1" size={10} fontWeight="bold">
          Sets
        </Text>
        <Box display="flex" gap={2}>
          <Button
            variant="secondary"
            onClick={() => rebuildAuditsMutation.mutate()}
            disabled={rebuildAuditsMutation.isLoading}
          >
            {rebuildAuditsMutation.isLoading
              ? "Rebuilding..."
              : "Rebuild Audits"}
          </Button>
          <Button
            variant="secondary"
            onClick={() => backfillAllAttrsMutation.mutate()}
            disabled={backfillAllAttrsMutation.isLoading}
          >
            {backfillAllAttrsMutation.isLoading
              ? "Fixing attrs..."
              : "Fix All Attrs"}
          </Button>
          <Button
            variant="secondary"
            onClick={() => backfillProductAttrsMutation.mutate({})}
            disabled={backfillProductAttrsMutation.isLoading}
          >
            {backfillProductAttrsMutation.isLoading
              ? "Backfilling..."
              : "Backfill Product Attrs"}
          </Button>
          {incompleteSets.length > 0 && (
            <Button
              variant="secondary"
              onClick={handleBackfillAllIncomplete}
              disabled={batchMutation.isLoading}
            >
              {batchMutation.isLoading
                ? "Creating jobs..."
                : `Re-import Incomplete (${incompleteSets.length})`}
            </Button>
          )}
        </Box>
      </Box>

      {/* Scan Results Panel */}
      {scanningSet && (
        <Box marginBottom={6}>
          <Box
            padding={4}
            borderRadius={4}
            borderWidth={1}
            borderStyle="solid"
            borderColor="default1"
          >
            <Box display="flex" justifyContent="space-between" alignItems="center" marginBottom={4}>
              <Text size={5} fontWeight="bold">
                {scanQuery.data
                  ? `Scan: ${scanQuery.data.setName}`
                  : `Scanning ${scanningSet.toUpperCase()}...`}
              </Text>
              <Box display="flex" gap={2}>
                {scanQuery.data &&
                  (scanQuery.data.missingCount > 0 || scanQuery.data.failedCount > 0) && (
                    <Button
                      variant="primary"
                      size="small"
                      onClick={() => handleBackfill(scanningSet)}
                      disabled={createMutation.isLoading}
                    >
                      Re-import {scanQuery.data.missingCount + scanQuery.data.failedCount} Cards
                    </Button>
                  )}
                <Button variant="secondary" size="small" onClick={() => setScanningSet(null)}>
                  Close
                </Button>
              </Box>
            </Box>
              {scanQuery.isLoading && (
                <InlineSpinner label="Scanning Scryfall data... this may take a moment." />
              )}
              {scanQuery.error && (
                <Box padding={4}>
                  <Text color="critical1">{scanQuery.error.message}</Text>
                </Box>
              )}
              {scanQuery.data && (
                <>
                  <Box display="flex" gap={6} padding={4} flexWrap="wrap">
                    <StatBox label="Scryfall Cards" value={String(scanQuery.data.scryfallTotal)} />
                    <StatBox label="Imported" value={String(scanQuery.data.importedCount)} />
                    <StatBox
                      label="Missing"
                      value={String(scanQuery.data.missingCount)}
                      color={scanQuery.data.missingCount > 0 ? "critical1" : "success1"}
                    />
                    <StatBox
                      label="Failed"
                      value={String(scanQuery.data.failedCount)}
                      color={scanQuery.data.failedCount > 0 ? "critical1" : "success1"}
                    />
                  </Box>

                  {scanQuery.data.missingCount === 0 && scanQuery.data.failedCount === 0 && (
                    <Box padding={4} paddingTop={0}>
                      <Text color="success1">All cards imported successfully.</Text>
                    </Box>
                  )}

                  {scanQuery.data.missingCards.length > 0 && (
                    <CardTable
                      title={`Missing Cards (${scanQuery.data.missingCards.length})`}
                      cards={scanQuery.data.missingCards}
                      showError={false}
                    />
                  )}

                  {scanQuery.data.failedCards.length > 0 && (
                    <CardTable
                      title={`Failed Cards (${scanQuery.data.failedCards.length})`}
                      cards={scanQuery.data.failedCards}
                      showError={true}
                    />
                  )}
                </>
              )}
          </Box>
        </Box>
      )}

      {/* Verification Detail Panel */}
      {verifyingSet && (
        <Box marginBottom={6}>
          <Box
            padding={4}
            borderRadius={4}
            borderWidth={1}
            borderStyle="solid"
            borderColor="default1"
          >
            <Box display="flex" justifyContent="space-between" alignItems="center" marginBottom={4}>
              <Text size={5} fontWeight="bold">
                {verifyQuery.data
                  ? `Verification: ${verifyQuery.data.setName}`
                  : `Verifying ${verifyingSet.toUpperCase()}...`}
              </Text>
              <Button variant="secondary" size="small" onClick={() => setVerifyingSet(null)}>
                Close
              </Button>
            </Box>
              {verifyQuery.isLoading && (
                <InlineSpinner label="Loading verification data..." />
              )}
              {verifyQuery.error && (
                <Box padding={4}>
                  <Text color="critical1">{verifyQuery.error.message}</Text>
                </Box>
              )}
              {verifyQuery.data && (
                <>
                  <Box display="flex" gap={6} padding={4} flexWrap="wrap">
                    <StatBox label="Set" value={verifyQuery.data.setCode.toUpperCase()} />
                    <StatBox label="Scryfall Total" value={String(verifyQuery.data.scryfallTotal)} />
                    <StatBox label="Imported" value={String(verifyQuery.data.imported)} />
                    <StatBox label="Newly Created" value={String(verifyQuery.data.newlyCreated)} />
                    <StatBox label="Already Existed" value={String(verifyQuery.data.alreadyExisted)} />
                    <StatBox label="Failed" value={String(verifyQuery.data.failed)} />
                    <StatBox
                      label="Completeness"
                      value={`${verifyQuery.data.completeness}%`}
                      color={
                        verifyQuery.data.completeness >= 100
                          ? "success1"
                          : verifyQuery.data.completeness >= 80
                          ? "info1"
                          : "critical1"
                      }
                    />
                  </Box>
                  {verifyQuery.data.lastImportedAt && (
                    <Box padding={4} paddingTop={0}>
                      <Text size={1} color="default2">
                        Last imported: {new Date(verifyQuery.data.lastImportedAt).toLocaleString()}
                      </Text>
                    </Box>
                  )}
                </>
              )}
          </Box>
        </Box>
      )}

      {/* Attribute Audit Panel */}
      {auditingSet && (
        <Box marginBottom={6}>
          <Box
            padding={4}
            borderRadius={4}
            borderWidth={1}
            borderStyle="solid"
            borderColor="default1"
          >
            <Box display="flex" justifyContent="space-between" alignItems="center" marginBottom={4}>
              <Text size={5} fontWeight="bold">
                {auditQuery.data
                  ? `Attribute Audit: ${auditingSet.toUpperCase()}`
                  : `Auditing ${auditingSet.toUpperCase()}...`}
              </Text>
              <Box display="flex" gap={2}>
                {auditQuery.data && auditQuery.data.summary.totalIssues > 0 && (
                  <Button
                    variant="primary"
                    size="small"
                    onClick={() => repairMutation.mutate({ setCode: auditingSet })}
                    disabled={repairMutation.isLoading}
                  >
                    {repairMutation.isLoading ? "Repairing..." : `Repair All (${auditQuery.data.summary.totalIssues})`}
                  </Button>
                )}
                <Button variant="secondary" size="small" onClick={() => setAuditingSet(null)}>
                  Close
                </Button>
              </Box>
            </Box>
              {auditQuery.isLoading && (
                <InlineSpinner label="Auditing product attributes... this may take a moment." />
              )}
              {auditQuery.error && (
                <Box padding={4}>
                  <Text color="critical1">{auditQuery.error.message}</Text>
                </Box>
              )}
              {auditQuery.data && (
                <>
                  <Box display="flex" gap={6} padding={4} flexWrap="wrap">
                    <StatBox label="Products Audited" value={String(auditQuery.data.productsAudited)} />
                    <StatBox
                      label="Missing Attributes"
                      value={String(auditQuery.data.summary.productsMissingAttributes)}
                      color={auditQuery.data.summary.productsMissingAttributes > 0 ? "critical1" : "success1"}
                    />
                    <StatBox
                      label="Stale Attributes"
                      value={String(auditQuery.data.summary.productsStaleAttributes)}
                      color={auditQuery.data.summary.productsStaleAttributes > 0 ? "critical1" : "success1"}
                    />
                    <StatBox
                      label="Stale Images"
                      value={String(auditQuery.data.summary.productsStaleImages)}
                      color={auditQuery.data.summary.productsStaleImages > 0 ? "critical1" : "success1"}
                    />
                  </Box>
                  {auditQuery.data.summary.totalIssues === 0 && (
                    <Box padding={4} paddingTop={0}>
                      <Text color="success1">All product attributes are up to date.</Text>
                    </Box>
                  )}
                  {auditQuery.data.attributeIssues.length > 0 && (
                    <Box padding={4} paddingTop={0}>
                      <DataTable
                        columns={[
                          {
                            header: "Name",
                            render: (issue) => <Text size={1}>{issue.cardName}</Text>,
                          },
                          {
                            header: "Missing",
                            align: "right",
                            render: (issue) => (
                              <Text size={1} color={issue.missingAttributes.length > 0 ? "critical1" : undefined}>
                                {issue.missingAttributes.length}
                              </Text>
                            ),
                          },
                          {
                            header: "Stale",
                            align: "right",
                            render: (issue) => (
                              <Text size={1} color={issue.staleAttributes.length > 0 ? "critical1" : undefined}>
                                {issue.staleAttributes.length}
                              </Text>
                            ),
                          },
                          {
                            header: "Image",
                            align: "center",
                            render: (issue) => (
                              <Text size={1} color={issue.imageStale ? "critical1" : "success1"}>
                                {issue.imageStale ? "Stale" : "OK"}
                              </Text>
                            ),
                          },
                        ]}
                        data={auditQuery.data.attributeIssues.slice(0, 50)}
                        rowKey={(issue) => issue.saleorProductId}
                        fontSize="13px"
                      />
                    </Box>
                  )}
                </>
              )}
          </Box>
        </Box>
      )}

      {/* Search and Filter Controls */}
      <Box
        padding={4}
        borderRadius={4}
        borderWidth={1}
        borderStyle="solid"
        borderColor="default1"
      >
        <Text size={5} fontWeight="bold" marginBottom={4}>
          Available Sets
        </Text>
        <Box display="flex" gap={4} marginBottom={4}>
          <Box __flex="1">
            <Input
              label="Search sets..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setDisplayLimit(DISPLAY_LIMIT);
              }}
              placeholder="Type set name or code..."
            />
          </Box>
          <Box __width="200px">
            <Select
              label="Set Type"
              value={filterType}
              onChange={(value) => {
                setFilterType(value as string);
                setDisplayLimit(DISPLAY_LIMIT);
              }}
              options={SET_TYPE_OPTIONS}
            />
          </Box>
        </Box>

        {isLoading ? (
          <TableSkeleton rows={8} />
        ) : !sets || sets.length === 0 ? (
            <Box padding={6} display="flex" justifyContent="center">
              <Text color="default2">No importable sets found. Check your connection to Scryfall.</Text>
            </Box>
        ) : filteredSets.length === 0 ? (
            <Box padding={6} display="flex" justifyContent="center">
              <Text color="default2">No sets match your search.</Text>
            </Box>
        ) : (
          <>
            <Box marginBottom={2}>
              <Text size={1} color="default2">
                Showing {displayedSets.length} of {filteredSets.length} sets
                {filteredSets.length !== totalSetsCount && ` (${totalSetsCount} total)`}
              </Text>
            </Box>
              <Box as="table" width="100%">
                <Box as="thead">
                  <Box as="tr">
                    <Box as="th" padding={2} textAlign="left" borderBottomStyle="solid" borderBottomWidth={1} borderColor="default2">
                      <Text fontWeight="bold">Code</Text>
                    </Box>
                    <Box as="th" padding={2} textAlign="left" borderBottomStyle="solid" borderBottomWidth={1} borderColor="default2">
                      <Text fontWeight="bold">Name</Text>
                    </Box>
                    <Box as="th" padding={2} textAlign="right" borderBottomStyle="solid" borderBottomWidth={1} borderColor="default2">
                      <Text fontWeight="bold">Cards</Text>
                    </Box>
                    <Box as="th" padding={2} textAlign="left" borderBottomStyle="solid" borderBottomWidth={1} borderColor="default2">
                      <Text fontWeight="bold">Released</Text>
                    </Box>
                    <Box as="th" padding={2} textAlign="left" borderBottomStyle="solid" borderBottomWidth={1} borderColor="default2">
                      <Text fontWeight="bold">Status</Text>
                    </Box>
                    <Box as="th" padding={2} textAlign="right" borderBottomStyle="solid" borderBottomWidth={1} borderColor="default2">
                      <Text fontWeight="bold">Actions</Text>
                    </Box>
                  </Box>
                </Box>
                <Box as="tbody">
                  {displayedSets.map((set) => {
                    const audit = importedSets.get(set.code);
                    const completeness = audit && audit.totalCards > 0
                      ? Math.round((audit.importedCards / audit.totalCards) * 100)
                      : null;

                    return (
                      <Box as="tr" key={set.id} className="data-table-row">
                        <Box as="td" padding={2}>
                          <Text fontWeight="bold">{set.code.toUpperCase()}</Text>
                        </Box>
                        <Box as="td" padding={2}>
                          <Text>{set.name}</Text>
                        </Box>
                        <Box as="td" padding={2} textAlign="right">
                          <Text>{set.card_count}</Text>
                        </Box>
                        <Box as="td" padding={2}>
                          <Text size={1}>{set.released_at ?? "\u2014"}</Text>
                        </Box>
                        <Box as="td" padding={2}>
                          {audit ? (
                            <Box>
                              <Text
                                size={1}
                                color={completeness !== null && completeness >= 100 ? "success1" : "info1"}
                              >
                                {audit.importedCards}/{audit.totalCards} ({completeness}%)
                              </Text>
                              <Box marginTop={1}>
                                <ProgressBar
                                  percent={completeness ?? 0}
                                  height="4px"
                                />
                              </Box>
                            </Box>
                          ) : (
                            <Text size={1} color="default2">Not imported</Text>
                          )}
                        </Box>
                        <Box as="td" padding={2} textAlign="right">
                          <Box display="flex" gap={2} justifyContent="flex-end" flexWrap="wrap">
                            <Button
                              size="small"
                              variant="tertiary"
                              onClick={() => {
                                setVerifyingSet(null);
                                setAuditingSet(null);
                                setScanningSet(set.code);
                              }}
                              disabled={scanningSet === set.code && scanQuery.isLoading}
                            >
                              {scanningSet === set.code && scanQuery.isLoading
                                ? "..."
                                : "Scan"}
                            </Button>
                            {audit && (
                              <>
                                <Button
                                  size="small"
                                  variant="tertiary"
                                  onClick={() => {
                                    setScanningSet(null);
                                    setAuditingSet(null);
                                    setVerifyingSet(set.code);
                                  }}
                                >
                                  Verify
                                </Button>
                                <Button
                                  size="small"
                                  variant="tertiary"
                                  onClick={() => {
                                    setScanningSet(null);
                                    setVerifyingSet(null);
                                    setAuditingSet(set.code);
                                  }}
                                  disabled={auditingSet === set.code && auditQuery.isLoading}
                                >
                                  {auditingSet === set.code && auditQuery.isLoading
                                    ? "..."
                                    : "Audit"}
                                </Button>
                                <Button
                                  size="small"
                                  variant="tertiary"
                                  onClick={() => backfillAttrsMutation.mutate({ setCode: set.code })}
                                  disabled={backfillAttrsMutation.isLoading}
                                >
                                  {backfillAttrsMutation.isLoading ? "..." : "Fix Attrs"}
                                </Button>
                              </>
                            )}
                            <Button
                              size="small"
                              variant={audit ? "secondary" : "primary"}
                              onClick={() => handleImportSet(set.code, set.card_count)}
                              disabled={createMutation.isLoading}
                            >
                              {audit ? "Re-import" : "Import"}
                            </Button>
                          </Box>
                        </Box>
                      </Box>
                    );
                  })}
                </Box>
              </Box>

            {displayedSets.length < filteredSets.length && (
              <Box display="flex" justifyContent="center" marginTop={4}>
                <Button
                  variant="secondary"
                  onClick={() => setDisplayLimit((prev) => prev + DISPLAY_LIMIT)}
                >
                  Show More ({filteredSets.length - displayedSets.length} remaining)
                </Button>
              </Box>
            )}
          </>
        )}
      </Box>
    </Box>
  );
};

function CardTable({
  title,
  cards,
  showError,
}: {
  title: string;
  cards: Array<{ scryfallId: string; collectorNumber: string; name: string; rarity?: string; errorMessage?: string | null }>;
  showError: boolean;
}) {
  return (
    <Box padding={4} paddingTop={0}>
      <Text as="p" fontWeight="bold" marginBottom={2}>
        {title}
      </Text>
      <DataTable
        columns={[
          {
            header: "#",
            render: (card) => <Text size={1}>{card.collectorNumber}</Text>,
          },
          {
            header: "Name",
            render: (card) => <Text size={1}>{card.name}</Text>,
          },
          {
            header: showError ? "Error" : "Rarity",
            render: (card) =>
              showError ? (
                <Text size={1} color="critical1">{card.errorMessage ?? "Unknown error"}</Text>
              ) : (
                <Text size={1}>{card.rarity}</Text>
              ),
          },
        ]}
        data={cards}
        rowKey={(card) => card.scryfallId}
        fontSize="13px"
      />
    </Box>
  );
}

export default SetsPage;
