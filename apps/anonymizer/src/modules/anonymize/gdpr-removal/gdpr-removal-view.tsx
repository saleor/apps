import { actions, useAppBridge } from "@saleor/app-sdk/app-bridge";
import { Box, Button, Text } from "@saleor/macaw-ui";
import { useState } from "react";
import { CombinedError, type OperationResult, useClient } from "urql";

import { env } from "@/env";
import {
  CheckoutDeleteDocument,
  CheckoutsForDeletionDocument,
  type CheckoutsForDeletionQuery,
  CustomerByIdDocument,
  CustomerDeleteDocument,
  GiftCardBulkDeleteDocument,
  GiftCardsForDeletionDocument,
  type GiftCardsForDeletionQuery,
  OrderUpdateDocument,
  UserByEmailDocument,
  type UserByEmailQuery,
} from "@/generated/graphql";
import { createLogger } from "@/logger";

import { chunkArray } from "../bulk-anonymize";
import { checkoutMatchesEmail } from "../checkouts";
import { ConfirmationModal } from "../confirmation-modal";
import { aggregateBalancesByCurrency, formatBalances, giftCardMatchesEmail } from "../gift-cards";
import { scrambleAddress, scrambleUserDetails } from "../scramble";
import { useCheckoutDeletionSupport } from "../use-checkout-deletion-support";
import { formatCustomerName, isStaffAccount, type ResolvedCustomer } from "./customer";
import {
  buildVerificationSummary,
  isRemovalFullyVerified,
  type VerificationLine,
} from "./verification";

const logger = createLogger("GdprRemovalView");

type OrderNode = NonNullable<UserByEmailQuery["orders"]>["edges"][number]["node"];
type GiftCardNode = NonNullable<GiftCardsForDeletionQuery["giftCards"]>["edges"][number]["node"];

type ScannedData = {
  customer: ResolvedCustomer;
  orders: OrderNode[];
  checkoutIds: string[];
  giftCards: GiftCardNode[];
};

/** Max gift card ids per `giftCardBulkDelete` call (mirrors the gift cards section). */
const GIFT_CARD_DELETE_BATCH_SIZE = 100;

type Stage = "idle" | "scanning" | "blocked" | "preview" | "executing" | "verifying" | "done";

/**
 * Walks every page of the customer's orders. Orders are read via the top-level
 * `orders` query filtered by email (not `User.orders`, which needs MANAGE_STAFF
 * this app lacks), which also covers guest-checkout orders sharing the email.
 */
const scanOrdersByEmail = async (
  client: ReturnType<typeof useClient>,
  email: string,
): Promise<OrderNode[]> => {
  const orders: OrderNode[] = [];
  let after: string | null = null;

  do {
    const result: OperationResult<UserByEmailQuery> = await client
      .query(UserByEmailDocument, { email, after }, { requestPolicy: "network-only" })
      .toPromise();

    if (result.error) {
      throw result.error;
    }

    const connection = result.data?.orders;

    if (!connection) {
      break;
    }

    orders.push(...connection.edges.map((edge) => edge.node));

    after = connection.pageInfo.hasNextPage ? connection.pageInfo.endCursor ?? null : null;
  } while (after);

  return orders;
};

/**
 * Walks every checkout and matches the customer email client-side. Saleor has no
 * exact server-side filter on a checkout's own email, and guest checkouts are
 * not cascade-deleted with the customer, so they must be found and deleted here.
 */
const scanCheckoutIdsByEmail = async (
  client: ReturnType<typeof useClient>,
  email: string,
): Promise<string[]> => {
  const ids: string[] = [];
  let after: string | null = null;

  do {
    const result: OperationResult<CheckoutsForDeletionQuery> = await client
      .query(CheckoutsForDeletionDocument, { after }, { requestPolicy: "network-only" })
      .toPromise();

    if (result.error) {
      throw result.error;
    }

    const connection = result.data?.checkouts;

    if (!connection) {
      break;
    }

    for (const { node } of connection.edges) {
      if (checkoutMatchesEmail(node, email)) {
        ids.push(node.id);
      }
    }

    after = connection.pageInfo.hasNextPage ? connection.pageInfo.endCursor ?? null : null;
  } while (after);

  return ids;
};

/**
 * Walks every gift card and matches the customer email (createdBy/usedBy/events)
 * client-side, since Saleor offers no server-side filter covering all three.
 */
const scanGiftCardsByEmail = async (
  client: ReturnType<typeof useClient>,
  email: string,
): Promise<GiftCardNode[]> => {
  const cards: GiftCardNode[] = [];
  let after: string | null = null;

  do {
    const result: OperationResult<GiftCardsForDeletionQuery> = await client
      .query(GiftCardsForDeletionDocument, { after }, { requestPolicy: "network-only" })
      .toPromise();

    if (result.error) {
      throw result.error;
    }

    const connection = result.data?.giftCards;

    if (!connection) {
      break;
    }

    for (const { node } of connection.edges) {
      if (giftCardMatchesEmail(node, email)) {
        cards.push(node);
      }
    }

    after = connection.pageInfo.hasNextPage ? connection.pageInfo.endCursor ?? null : null;
  } while (after);

  return cards;
};

/**
 * The GDPR Removal popup, opened from a customer's detail page. Staged flow:
 * scan -> review the exact list -> confirm (red) -> execute -> verify by
 * re-scanning. The customer id is supplied by the Dashboard as a query param.
 */
export const GdprRemovalView = ({ customerId }: { customerId: string }) => {
  const client = useClient();
  const { appBridge } = useAppBridge();
  const { supported: checkoutDeletionSupported, fetching: versionFetching } =
    useCheckoutDeletionSupport();

  const [stage, setStage] = useState<Stage>("idle");
  const [error, setError] = useState<string | null>(null);
  const [staffEmail, setStaffEmail] = useState<string | null>(null);
  const [scanned, setScanned] = useState<ScannedData | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [executionFailures, setExecutionFailures] = useState<string[]>([]);
  const [verification, setVerification] = useState<VerificationLine[] | null>(null);

  const resolveCustomer = async (): Promise<ResolvedCustomer | null> => {
    const result = await client
      .query(CustomerByIdDocument, { id: customerId }, { requestPolicy: "network-only" })
      .toPromise();

    if (result.error) {
      throw result.error;
    }

    return result.data?.user ?? null;
  };

  const handleScan = async () => {
    setError(null);
    setStaffEmail(null);
    setScanned(null);
    setExecutionFailures([]);
    setVerification(null);
    setStage("scanning");

    try {
      const customer = await resolveCustomer();

      if (!customer) {
        setError("This customer no longer exists.");
        setStage("idle");

        return;
      }

      if (isStaffAccount(customer)) {
        setStaffEmail(customer.email);
        setStage("blocked");

        return;
      }

      const orders = await scanOrdersByEmail(client, customer.email);
      // Only stores on Saleor >= 3.23 can delete checkouts; below that they are skipped.
      const checkoutIds = checkoutDeletionSupported
        ? await scanCheckoutIdsByEmail(client, customer.email)
        : [];
      const giftCards = await scanGiftCardsByEmail(client, customer.email);

      setScanned({ customer, orders, checkoutIds, giftCards });
      setStage("preview");
    } catch (caughtError) {
      logger.error("Failed to scan customer data", { error: caughtError });

      const message =
        caughtError instanceof CombinedError
          ? caughtError.graphQLErrors.map((graphQLError) => graphQLError.message).join(" ") ||
            caughtError.message
          : "Failed to scan customer data. Check the app permissions and try again.";

      setError(message);
      setStage("idle");
    }
  };

  /** Runs all removal mutations, customer account deleted last. */
  const executeRemoval = async (data: ScannedData): Promise<string[]> => {
    const failures: string[] = [];
    const scrambledUser = scrambleUserDetails(env.NEXT_PUBLIC_CUSTOMER_SCRAMBLE_DOMAIN);

    for (const order of data.orders) {
      const result = await client
        .mutation(OrderUpdateDocument, {
          id: order.id,
          input: {
            userEmail: scrambledUser.email,
            billingAddress: scrambleAddress(order.billingAddress),
            shippingAddress: scrambleAddress(order.shippingAddress),
          },
        })
        .toPromise();

      if (result.error || result.data?.orderUpdate?.errors?.length) {
        logger.error("Failed to update order", {
          orderNumber: order.number,
          error: result.error,
          mutationErrors: result.data?.orderUpdate?.errors,
        });
        failures.push(`Failed to anonymize order #${order.number}`);
      }
    }

    for (const checkoutId of data.checkoutIds) {
      const result = await client.mutation(CheckoutDeleteDocument, { id: checkoutId }).toPromise();

      if (result.error || result.data?.checkoutDelete?.errors?.length) {
        logger.error("Failed to delete checkout", {
          checkoutId,
          error: result.error,
          mutationErrors: result.data?.checkoutDelete?.errors,
        });
        failures.push(`Failed to delete a checkout (${checkoutId}).`);
      }
    }

    for (const batch of chunkArray(data.giftCards, GIFT_CARD_DELETE_BATCH_SIZE)) {
      const result = await client
        .mutation(GiftCardBulkDeleteDocument, { ids: batch.map((card) => card.id) })
        .toPromise();

      const mutationErrors = result.data?.giftCardBulkDelete?.errors ?? [];

      if (result.error || mutationErrors.length) {
        logger.error("Failed to delete gift cards", {
          error: result.error,
          mutationErrors: mutationErrors.map((mutationError) => mutationError.message),
        });
        failures.push("Failed to delete some gift cards.");
      }
    }

    /*
     * Delete the account last and only when everything before it succeeded, so a
     * partial failure leaves the customer in place for the operator to re-scan
     * and retry rather than orphaning still-identifiable orders.
     */
    if (!failures.length) {
      const result = await client
        .mutation(CustomerDeleteDocument, { id: data.customer.id })
        .toPromise();

      if (result.error || result.data?.customerDelete?.errors?.length) {
        logger.error("Failed to delete the customer", {
          error: result.error,
          mutationErrors: result.data?.customerDelete?.errors,
        });
        failures.push("Failed to delete the customer account.");
      }
    }

    return failures;
  };

  /** Re-scans by the original email and asserts nothing remains. */
  const verifyRemoval = async (data: ScannedData): Promise<VerificationLine[]> => {
    const { email } = data.customer;

    const remainingCustomer = await resolveCustomer();
    const remainingOrders = await scanOrdersByEmail(client, email);
    const remainingCheckouts = checkoutDeletionSupported
      ? await scanCheckoutIdsByEmail(client, email)
      : [];
    const remainingGiftCards = await scanGiftCardsByEmail(client, email);

    return buildVerificationSummary(
      {
        remainingOrders: remainingOrders.length,
        remainingCheckouts: remainingCheckouts.length,
        remainingGiftCards: remainingGiftCards.length,
        customerStillExists: remainingCustomer !== null,
      },
      { checkoutsApplicable: checkoutDeletionSupported, hadCustomerAccount: true },
    );
  };

  const handleConfirm = async () => {
    if (!scanned) {
      return;
    }

    setConfirmOpen(false);
    setError(null);
    setStage("executing");

    try {
      const failures = await executeRemoval(scanned);

      setExecutionFailures(failures);
      setStage("verifying");

      const lines = await verifyRemoval(scanned);

      setVerification(lines);
      setStage("done");
    } catch (caughtError) {
      logger.error("GDPR removal failed", { error: caughtError });
      setError("Removal failed unexpectedly. Re-scan to check the current state and retry.");
      setStage("idle");
    }
  };

  /*
   * The customer detail page this popup was opened from no longer exists once
   * the account is deleted, so navigate the Dashboard back to the customer list.
   */
  const handleFinish = () => {
    appBridge?.dispatch(actions.Redirect({ to: "/customers" }));
  };

  const giftCardBalances = scanned ? aggregateBalancesByCurrency(scanned.giftCards) : [];

  return (
    <Box display="flex" flexDirection="column" gap={6}>
      {error && (
        <Text color="critical1" as="p">
          {error}
        </Text>
      )}

      {stage === "blocked" && (
        <Box backgroundColor="warning1" padding={4} borderRadius={3}>
          <Text as="p" fontWeight="bold">
            This is a staff account and cannot be removed here.
          </Text>
          <Text as="p" size={2}>
            {staffEmail} is a staff member. GDPR removal is only available for customer accounts.
          </Text>
        </Box>
      )}

      {stage === "idle" && (
        <Box display="flex" flexDirection="column" gap={3} alignItems="start">
          <Text as="p">
            Scan this customer&apos;s orders, checkouts and gift cards before removing them. Nothing
            is changed until you confirm.
          </Text>
          <Button onClick={handleScan} disabled={versionFetching}>
            Scan customer data
          </Button>
        </Box>
      )}

      {stage === "scanning" && <Text>Scanning orders, checkouts and gift cards…</Text>}

      {stage === "preview" && scanned && (
        <Box display="flex" flexDirection="column" gap={5}>
          <Text as="p">
            Removing <strong>{formatCustomerName(scanned.customer)}</strong> (
            {scanned.customer.email}) will anonymize or delete the following. This cannot be undone.
          </Text>

          <Box display="flex" flexDirection="column" gap={1}>
            <Text fontWeight="bold">{`Orders to anonymize: ${scanned.orders.length}`}</Text>
            {scanned.orders.length > 0 && (
              <Box as="ul" margin={0}>
                {scanned.orders.map((order) => (
                  <li key={order.id}>
                    <Text size={2}>{`Order #${order.number}`}</Text>
                  </li>
                ))}
              </Box>
            )}
          </Box>

          <Box display="flex" flexDirection="column" gap={1}>
            <Text fontWeight="bold">{`Checkouts to delete: ${scanned.checkoutIds.length}`}</Text>
            {!checkoutDeletionSupported && (
              <Text size={2}>
                Checkout deletion requires Saleor 3.23+ and is skipped on this store.
              </Text>
            )}
          </Box>

          <Box display="flex" flexDirection="column" gap={1}>
            <Text fontWeight="bold">{`Gift cards to delete: ${scanned.giftCards.length}`}</Text>
            {giftCardBalances.length > 0 && (
              <Text size={2} color="critical1">
                {`Balance permanently destroyed: ${formatBalances(giftCardBalances)}.`}
              </Text>
            )}
          </Box>

          <Text as="p" size={2}>
            The customer account will be permanently deleted.
          </Text>

          <Box display="flex" gap={3}>
            <Button variant="error" onClick={() => setConfirmOpen(true)}>
              GDPR removal
            </Button>
            <Button variant="secondary" onClick={() => setStage("idle")}>
              Cancel
            </Button>
          </Box>
        </Box>
      )}

      {stage === "executing" && <Text>Removing customer data…</Text>}
      {stage === "verifying" && <Text>Verifying removal…</Text>}

      {stage === "done" && verification && (
        <Box display="flex" flexDirection="column" gap={3}>
          <Text
            fontWeight="bold"
            color={isRemovalFullyVerified(verification) ? "default1" : "critical1"}
          >
            {isRemovalFullyVerified(verification)
              ? "GDPR removal complete and verified."
              : "GDPR removal finished with issues — see below."}
          </Text>
          <Box as="ul" margin={0} display="flex" flexDirection="column" gap={1}>
            {verification.map((line) => (
              <li key={line.type}>
                <Text color={line.status === "failed" ? "critical1" : "default1"}>
                  {`${line.status === "ok" ? "✓" : line.status === "skipped" ? "–" : "✗"} ${
                    line.label
                  }`}
                </Text>
              </li>
            ))}
          </Box>
          {executionFailures.length > 0 && (
            <Box display="flex" flexDirection="column" gap={0.5}>
              {executionFailures.map((failure, index) => (
                <Text key={index} color="critical1" size={2}>
                  {failure}
                </Text>
              ))}
            </Box>
          )}
          <Box display="flex" gap={3}>
            <Button onClick={handleFinish}>Finish</Button>
            <Button variant="secondary" onClick={handleScan}>
              Re-scan
            </Button>
          </Box>
        </Box>
      )}

      <ConfirmationModal
        open={confirmOpen}
        title="Permanently remove this customer?"
        description={
          scanned
            ? `This will anonymize ${scanned.orders.length} order(s), delete ${scanned.checkoutIds.length} checkout(s) and ${scanned.giftCards.length} gift card(s), and permanently delete the customer account. This cannot be undone.`
            : ""
        }
        confirmLabel="Remove customer"
        onCancel={() => setConfirmOpen(false)}
        onConfirm={handleConfirm}
      />
    </Box>
  );
};
