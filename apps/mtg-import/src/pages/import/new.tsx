import { useDashboardNotification } from "@saleor/apps-shared/use-dashboard-notification";
import { Breadcrumbs } from "@saleor/apps-ui";
import { Box, Button, Input, Select, Text } from "@saleor/macaw-ui";
import { NextPage } from "next";
import Link from "next/link";
import { useRouter } from "next/router";
import { useState, useMemo } from "react";

import { trpcClient } from "@/modules/trpc/trpc-client";
import { ConfirmModal } from "@/ui/components";

const NewImportPage: NextPage = () => {
  const router = useRouter();
  const { notifySuccess, notifyError } = useDashboardNotification();
  const [importType, setImportType] = useState<"SET" | "BULK" | "BACKFILL">("SET");
  const [setCode, setSetCode] = useState("");
  const [setSearch, setSetSearch] = useState("");
  const [priority, setPriority] = useState(2);
  const [showSetPicker, setShowSetPicker] = useState(false);
  const [confirmMessage, setConfirmMessage] = useState<string | null>(null);

  const { data: sets } = trpcClient.sets.list.useQuery(undefined, {
    enabled: importType === "SET" || importType === "BULK",
  });

  const bulkEstimate = useMemo(() => {
    if (!sets) return null;
    const totalCards = sets.reduce((sum, s) => sum + s.card_count, 0);
    return { totalSets: sets.length, totalCards };
  }, [sets]);

  const createMutation = trpcClient.jobs.create.useMutation({
    onSuccess: (job) => {
      notifySuccess("Import started", `Job created for ${importType} import.`);
      router.push(`/import/${job.id}`);
    },
    onError: (err) => notifyError("Import failed", err.message),
  });

  const filteredSets = useMemo(() => {
    if (!sets || !setSearch) return sets?.slice(0, 20) ?? [];
    const q = setSearch.toLowerCase();
    return sets
      .filter(
        (s) =>
          s.code.toLowerCase().includes(q) ||
          s.name.toLowerCase().includes(q)
      )
      .slice(0, 20);
  }, [sets, setSearch]);

  const selectedSet = useMemo(
    () => sets?.find((s) => s.code === setCode.toLowerCase()),
    [sets, setCode]
  );

  const handleSelectSet = (code: string) => {
    setSetCode(code);
    setSetSearch("");
    setShowSetPicker(false);
  };

  const doSubmit = () => {
    createMutation.mutate({
      type: importType,
      setCode: importType === "SET" ? setCode.toLowerCase() : undefined,
      priority,
    });
  };

  const handleSubmit = () => {
    if (importType === "BULK") {
      const cardCount = bulkEstimate?.totalCards ?? 100_000;
      setConfirmMessage(
        `This will import ALL ~${cardCount.toLocaleString()} cards from Scryfall (${bulkEstimate?.totalSets ?? "many"} sets). This may take several hours. Proceed?`
      );
    } else if (importType === "SET" && selectedSet && selectedSet.card_count > 500) {
      setConfirmMessage(
        `Import ${selectedSet.name} (${selectedSet.card_count} cards)? This may take a few minutes.`
      );
    } else {
      doSubmit();
    }
  };

  return (
    <Box>
      <ConfirmModal
        open={!!confirmMessage}
        title="Confirm Import"
        message={confirmMessage ?? ""}
        confirmLabel="Start Import"
        onConfirm={doSubmit}
        onClose={() => setConfirmMessage(null)}
      />

      <Box marginBottom={4}>
        <Breadcrumbs>
          <Breadcrumbs.Item>
            <Link href="/import">Import Jobs</Link>
          </Breadcrumbs.Item>
          <Breadcrumbs.Item>New Import</Breadcrumbs.Item>
        </Breadcrumbs>
      </Box>

      <Box marginBottom={6}>
        <Text as="h1" size={10} fontWeight="bold">
          New Import
        </Text>
      </Box>

      <Box
        padding={4}
        borderRadius={4}
        borderWidth={1}
        borderStyle="solid"
        borderColor="default1"
      >
        <Text size={5} fontWeight="bold" marginBottom={4}>
          Import Configuration
        </Text>
          <Box display="flex" flexDirection="column" gap={4}>
            <Box>
              <Text as="p" fontWeight="bold" marginBottom={2}>
                Import Type
              </Text>
              <Select
                label="Import Type"
                value={importType}
                onChange={(value) => setImportType(value as "SET" | "BULK" | "BACKFILL")}
                options={[
                  { value: "SET", label: "Set Import" },
                  { value: "BULK", label: "Bulk Import" },
                  { value: "BACKFILL", label: "Backfill" },
                ]}
              />
            </Box>

            {importType === "BULK" && bulkEstimate && (
              <Box padding={3} backgroundColor="default1" borderRadius={2}>
                <Text size={2} fontWeight="bold" marginBottom={1}>
                  Bulk Import Estimate
                </Text>
                <Text size={1} color="default2">
                  {bulkEstimate.totalSets.toLocaleString()} sets, ~{bulkEstimate.totalCards.toLocaleString()} cards total.
                  Each card creates up to 15 variants (5 conditions x 3 finishes).
                  Estimated time: {Math.ceil(bulkEstimate.totalCards / 500)} - {Math.ceil(bulkEstimate.totalCards / 200)} minutes.
                </Text>
              </Box>
            )}

            {importType === "SET" && (
              <Box>
                <Text as="p" fontWeight="bold" marginBottom={2}>
                  Set Code
                </Text>
                {selectedSet ? (
                  <Box
                    display="flex"
                    alignItems="center"
                    gap={3}
                    padding={3}
                    backgroundColor="default1"
                    borderRadius={2}
                  >
                    <Box __flex="1">
                      <Text fontWeight="bold">
                        {selectedSet.code.toUpperCase()} — {selectedSet.name}
                      </Text>
                      <Text size={1} color="default2">
                        {selectedSet.card_count} cards
                        {selectedSet.released_at ? ` | Released ${selectedSet.released_at}` : ""}
                      </Text>
                    </Box>
                    <Button
                      size="small"
                      variant="secondary"
                      onClick={() => {
                        setSetCode("");
                        setShowSetPicker(true);
                      }}
                    >
                      Change
                    </Button>
                  </Box>
                ) : (
                  <Box position="relative">
                    <Input
                      label="Search sets..."
                      value={setSearch || setCode}
                      onChange={(e) => {
                        setSetSearch(e.target.value);
                        setSetCode(e.target.value);
                        setShowSetPicker(true);
                      }}
                      onFocus={() => setShowSetPicker(true)}
                      placeholder="Type to search (e.g., lea, modern horizons)"
                    />
                    {showSetPicker && filteredSets.length > 0 && (
                      <Box
                        position="absolute"
                        __zIndex="10"
                        __width="100%"
                        __maxHeight="300px"
                        overflow="auto"
                        backgroundColor="default1"
                        borderRadius={2}
                        __boxShadow="0 4px 12px rgba(0,0,0,0.15)"
                        marginTop={1}
                      >
                        {filteredSets.map((set) => (
                          <Box
                            key={set.id}
                            padding={2}
                            paddingX={3}
                            cursor="pointer"
                            onClick={() => handleSelectSet(set.code)}
                            className="data-table-row"
                          >
                            <Text fontWeight="bold" size={2}>
                              {set.code.toUpperCase()}
                            </Text>
                            <Text size={1}> {set.name}</Text>
                            <Text size={1} color="default2">
                              {" "}({set.card_count} cards
                              {set.released_at ? `, ${set.released_at}` : ""})
                            </Text>
                          </Box>
                        ))}
                      </Box>
                    )}
                  </Box>
                )}
              </Box>
            )}

            <Box>
              <Text as="p" fontWeight="bold" marginBottom={2}>
                Priority
              </Text>
              <Select
                label="Priority"
                value={String(priority)}
                onChange={(value) => setPriority(Number(value))}
                options={[
                  { value: "0", label: "0 - Prerelease (highest)" },
                  { value: "1", label: "1 - Reprint" },
                  { value: "2", label: "2 - Backfill (lowest)" },
                ]}
              />
            </Box>

            {createMutation.error && (
              <Box padding={3} backgroundColor="critical1" borderRadius={2}>
                <Text>{createMutation.error.message}</Text>
              </Box>
            )}

            <Box display="flex" gap={4}>
              <Button
                onClick={handleSubmit}
                disabled={createMutation.isLoading || (importType === "SET" && !setCode)}
              >
                {createMutation.isLoading ? "Creating..." : "Start Import"}
              </Button>
              <Button variant="secondary" onClick={() => router.push("/import")}>
                Cancel
              </Button>
            </Box>
          </Box>
      </Box>
    </Box>
  );
};

export default NewImportPage;
