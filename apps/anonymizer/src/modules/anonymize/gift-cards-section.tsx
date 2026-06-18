import { Box, Button, Input, Text } from "@saleor/macaw-ui";
import { type Dispatch, type SetStateAction, useState } from "react";
import { type OperationResult, useClient } from "urql";

import {
  GiftCardBulkDeleteDocument,
  GiftCardsForDeletionDocument,
  type GiftCardsForDeletionQuery,
} from "@/generated/graphql";
import { createLogger } from "@/logger";

import { chunkArray } from "./bulk-anonymize";
import { ConfirmationModal } from "./confirmation-modal";
import { aggregateBalancesByCurrency, formatBalances, giftCardMatchesEmail } from "./gift-cards";
import { type Failure, idleRun, RunProgress, RunResult, type RunState } from "./run-state";

const logger = createLogger("GiftCardsSection");

type ScannedGiftCard = NonNullable<GiftCardsForDeletionQuery["giftCards"]>["edges"][number]["node"];

/** Max gift card ids per `giftCardBulkDelete` call. */
const GIFT_CARD_DELETE_BATCH_SIZE = 100;

/**
 * Gift card PII cannot be scrubbed in place (emails, user links and events are
 * read-only), so the only way to remove it is to delete the card - which also
 * destroys its remaining balance. Two explicitly-triggered flows:
 * - "by email" deletes a customer's gift cards (GDPR erasure).
 * - "delete all" wipes every gift card, for sanitizing dev/staging data copies.
 */
export const GiftCardsSection = () => {
  const client = useClient();

  // By-email (GDPR) flow.
  const [email, setEmail] = useState("");
  const [finding, setFinding] = useState(false);
  const [matched, setMatched] = useState<ScannedGiftCard[] | null>(null);
  const [byEmailRun, setByEmailRun] = useState<RunState>(idleRun);

  // Delete-all (dev/staging) flow.
  const [scanning, setScanning] = useState(false);
  const [allCards, setAllCards] = useState<ScannedGiftCard[] | null>(null);
  const [bulkRun, setBulkRun] = useState<RunState>(idleRun);

  const [error, setError] = useState<string | null>(null);
  const [pendingAction, setPendingAction] = useState<"byEmail" | "bulk" | null>(null);

  const busy = finding || scanning || byEmailRun.running || bulkRun.running;

  /**
   * Walks every gift card. There is no server-side filter for `usedByEmail`, so
   * the by-email flow scans all and filters client-side; the delete-all flow
   * needs every card anyway.
   */
  const scanAllGiftCards = async (): Promise<ScannedGiftCard[]> => {
    const cards: ScannedGiftCard[] = [];
    let after: string | null = null;

    do {
      const result: OperationResult<GiftCardsForDeletionQuery> = await client
        .query(
          GiftCardsForDeletionDocument,
          { after },
          // Always hit the network: a re-scan must reflect the latest store state, not urql's cache.
          { requestPolicy: "network-only" },
        )
        .toPromise();

      if (result.error || !result.data?.giftCards) {
        throw new Error(result.error?.message ?? "Gift cards query returned no data");
      }

      for (const { node } of result.data.giftCards.edges) {
        cards.push(node);
      }

      const { pageInfo } = result.data.giftCards;

      after = pageInfo.hasNextPage ? pageInfo.endCursor ?? null : null;
    } while (after);

    return cards;
  };

  /**
   * Deletes the given gift cards via `giftCardBulkDelete` in chunks. The
   * mutation returns an aggregate count and errors, so partial failures within a
   * chunk cannot be attributed to individual cards - they are reported as the
   * raw error messages.
   */
  const runDeletion = async (
    cards: ScannedGiftCard[],
    setRun: Dispatch<SetStateAction<RunState>>,
  ) => {
    setRun({ ...idleRun, running: true, total: cards.length });

    let deleted = 0;
    const failures: Failure[] = [];
    let chunkIndex = 0;

    for (const batch of chunkArray(cards, GIFT_CARD_DELETE_BATCH_SIZE)) {
      const result = await client
        .mutation(GiftCardBulkDeleteDocument, { ids: batch.map((card) => card.id) })
        .toPromise();

      const mutationErrors = result.data?.giftCardBulkDelete?.errors ?? [];

      if (result.error || mutationErrors.length) {
        logger.error("Failed to delete gift cards", {
          error: result.error,
          mutationErrors: mutationErrors.map((mutationError) => mutationError.message),
        });

        if (result.error) {
          failures.push({ id: `chunk-${chunkIndex}-network`, label: result.error.message });
        }

        mutationErrors.forEach((mutationError, index) => {
          failures.push({
            id: `chunk-${chunkIndex}-error-${index}`,
            label: mutationError.message ?? "Unknown error",
          });
        });
      }

      deleted += result.data?.giftCardBulkDelete?.count ?? 0;
      chunkIndex += 1;

      setRun((previous) => ({
        ...previous,
        done: Math.min(previous.done + batch.length, cards.length),
      }));
    }

    setRun({
      running: false,
      done: cards.length,
      total: cards.length,
      failures,
      finishedSummary: failures.length
        ? `Deleted ${deleted} of ${cards.length} gift cards. Failed:`
        : `Deleted ${deleted} gift cards.`,
    });
  };

  const handleFind = async () => {
    setError(null);
    setMatched(null);
    setByEmailRun(idleRun);
    setFinding(true);

    try {
      const cards = await scanAllGiftCards();

      setMatched(cards.filter((card) => giftCardMatchesEmail(card, email)));
    } catch (caughtError) {
      logger.error("Failed to scan gift cards", { error: caughtError });
      setError("Failed to load gift cards. Check the app permissions and try again.");
    } finally {
      setFinding(false);
    }
  };

  const handleScanAll = async () => {
    setError(null);
    setAllCards(null);
    setBulkRun(idleRun);
    setScanning(true);

    try {
      setAllCards(await scanAllGiftCards());
    } catch (caughtError) {
      logger.error("Failed to scan gift cards", { error: caughtError });
      setError("Failed to load gift cards. Check the app permissions and try again.");
    } finally {
      setScanning(false);
    }
  };

  const deleteMatched = async () => {
    await runDeletion(matched ?? [], setByEmailRun);
    // Deleted cards no longer exist; clear so the operator re-runs the search.
    setMatched(null);
  };

  const deleteAll = async () => {
    await runDeletion(allCards ?? [], setBulkRun);
    setAllCards(null);
  };

  const matchedBalances = matched ? aggregateBalancesByCurrency(matched) : [];
  const allBalances = allCards ? aggregateBalancesByCurrency(allCards) : [];

  return (
    <Box display="flex" flexDirection="column" gap={8}>
      {error && <Text color="critical1">{error}</Text>}

      <Box display="flex" flexDirection="column" gap={3} alignItems="start">
        <Text fontWeight="bold">Delete a customer&apos;s gift cards by email</Text>
        <Text size={2}>
          Matches gift cards the customer bought or redeemed (createdByEmail or usedByEmail).
          Deleting a gift card permanently destroys its remaining balance.
        </Text>
        <Input
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Enter customer email"
          disabled={busy}
        />
        <Button onClick={handleFind} disabled={!email || busy}>
          {finding ? "Searching..." : "Find gift cards"}
        </Button>

        {matched !== null &&
          (matched.length ? (
            <Box display="flex" flexDirection="column" gap={2} alignItems="start">
              <Text>
                {`Found ${matched.length} gift card(s).`}
                {matchedBalances.length
                  ? ` Balance at risk: ${formatBalances(matchedBalances)}.`
                  : ""}
              </Text>
              <Button onClick={() => setPendingAction("byEmail")} disabled={busy}>
                Delete gift cards
              </Button>
            </Box>
          ) : (
            <Text>No gift cards found for this email.</Text>
          ))}

        <RunProgress run={byEmailRun} label="Deleting gift cards" />
        <RunResult run={byEmailRun} />
      </Box>

      <Box display="flex" flexDirection="column" gap={3} alignItems="start">
        <Text fontWeight="bold">Delete ALL gift cards</Text>
        <Text size={2}>
          For sanitizing data copied to a dev/staging environment. This permanently deletes every
          gift card in the store and destroys all balances. Use at your own risk.
        </Text>
        <Button onClick={handleScanAll} disabled={busy}>
          {scanning ? "Scanning..." : allCards ? "Re-scan" : "Scan all gift cards"}
        </Button>

        {allCards !== null && (
          <Box display="flex" flexDirection="column" gap={2} alignItems="start">
            <Text>
              {`${allCards.length} gift card(s) in the store.`}
              {allBalances.length
                ? ` Balance to be destroyed: ${formatBalances(allBalances)}.`
                : ""}
            </Text>
            <Button
              onClick={() => setPendingAction("bulk")}
              disabled={busy || allCards.length === 0}
            >
              Delete all gift cards
            </Button>
          </Box>
        )}

        <RunProgress run={bulkRun} label="Deleting all gift cards" />
        <RunResult run={bulkRun} />
      </Box>

      <ConfirmationModal
        open={pendingAction === "byEmail"}
        title="Delete these gift cards?"
        description={`This will permanently delete ${matched?.length ?? 0} gift card(s)${
          matchedBalances.length ? ` and destroy ${formatBalances(matchedBalances)}` : ""
        }. This cannot be undone.`}
        confirmLabel="Delete gift cards"
        onCancel={() => setPendingAction(null)}
        onConfirm={() => {
          setPendingAction(null);
          deleteMatched();
        }}
      />

      <ConfirmationModal
        open={pendingAction === "bulk"}
        title="Delete ALL gift cards?"
        description={`This will permanently delete every gift card in the store (${
          allCards?.length ?? 0
        })${
          allBalances.length ? ` and destroy ${formatBalances(allBalances)}` : ""
        }. This cannot be undone.`}
        confirmLabel="Delete all gift cards"
        onCancel={() => setPendingAction(null)}
        onConfirm={() => {
          setPendingAction(null);
          deleteAll();
        }}
      />
    </Box>
  );
};
