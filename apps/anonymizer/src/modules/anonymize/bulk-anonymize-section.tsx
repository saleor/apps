import { Box, Button, Text } from "@saleor/macaw-ui";
import { useState } from "react";
import { type OperationResult, useClient } from "urql";

import { env } from "@/env";
import {
  CheckoutDeleteDocument,
  CheckoutsForDeletionDocument,
  type CheckoutsForDeletionQuery,
  CustomerDeleteDocument,
  CustomersForDeletionDocument,
  type CustomersForDeletionQuery,
  OrdersForAnonymizationDocument,
  type OrdersForAnonymizationQuery,
  OrderUpdateDocument,
  UpdateMetadataDocument,
} from "@/generated/graphql";
import { createLogger } from "@/logger";

import {
  ANONYMIZED_METADATA_KEY,
  ANONYMIZED_METADATA_VALUE,
  chunkArray,
  isOrderAnonymized,
} from "./bulk-anonymize";
import { ConfirmationModal } from "./confirmation-modal";
import { type Failure, idleRun, RunProgress, RunResult, type RunState } from "./run-state";
import { scrambleAddress, scrambleUserDetails } from "./scramble";
import { useCheckoutDeletionSupport } from "./use-checkout-deletion-support";

const logger = createLogger("BulkAnonymizeSection");

type ScannedOrder = NonNullable<OrdersForAnonymizationQuery["orders"]>["edges"][number]["node"];
type ScannedCustomer = NonNullable<CustomersForDeletionQuery["customers"]>["edges"][number]["node"];
type ScannedCheckout = NonNullable<CheckoutsForDeletionQuery["checkouts"]>["edges"][number]["node"];

/**
 * Scans the whole store and bulk-processes it from the browser:
 * - "Anonymize orders" scrambles every order that does not yet carry the
 *   `saleor-anonymized: true` public metadata flag, then writes the flag.
 * - "Delete customers" deletes every non-staff customer account.
 * - "Delete checkouts" deletes every checkout (removing all of its PII).
 *   Requires Saleor 3.23+, where `checkoutDelete` exists.
 *
 * The scan keeps full payloads in memory, so running an action does not
 * re-fetch anything. Failures are collected (not aborting the run) and listed
 * as links opening the record in a new Dashboard tab - except checkouts, which
 * have no Dashboard detail page and are listed as plain text.
 */
export const BulkAnonymizeSection = () => {
  const client = useClient();
  const { supported: checkoutDeletionSupported } = useCheckoutDeletionSupport();

  const [scanning, setScanning] = useState(false);
  const [scanError, setScanError] = useState<string | null>(null);
  const [scanResult, setScanResult] = useState<{
    orders: ScannedOrder[];
    customers: ScannedCustomer[];
    checkouts: ScannedCheckout[];
  } | null>(null);

  const [ordersRun, setOrdersRun] = useState<RunState>(idleRun);
  const [customersRun, setCustomersRun] = useState<RunState>(idleRun);
  const [checkoutsRun, setCheckoutsRun] = useState<RunState>(idleRun);

  // Which destructive action is awaiting confirmation, if any.
  const [pendingAction, setPendingAction] = useState<"orders" | "customers" | "checkouts" | null>(
    null,
  );

  const busy = scanning || ordersRun.running || customersRun.running || checkoutsRun.running;

  const scan = async () => {
    setScanning(true);
    setScanError(null);

    try {
      const orders: ScannedOrder[] = [];
      let ordersAfter: string | null = null;

      do {
        const result: OperationResult<OrdersForAnonymizationQuery> = await client
          .query(
            OrdersForAnonymizationDocument,
            { after: ordersAfter },
            // Always hit the network: a re-scan must reflect the latest store state, not urql's cache.
            { requestPolicy: "network-only" },
          )
          .toPromise();

        if (result.error || !result.data?.orders) {
          throw new Error(result.error?.message ?? "Orders query returned no data");
        }

        for (const { node } of result.data.orders.edges) {
          if (!isOrderAnonymized(node.metadata)) {
            orders.push(node);
          }
        }

        const { pageInfo } = result.data.orders;

        ordersAfter = pageInfo.hasNextPage ? pageInfo.endCursor ?? null : null;
      } while (ordersAfter);

      const customers: ScannedCustomer[] = [];
      let customersAfter: string | null = null;

      do {
        const result: OperationResult<CustomersForDeletionQuery> = await client
          .query(
            CustomersForDeletionDocument,
            { after: customersAfter },
            // Always hit the network: a re-scan must reflect the latest store state, not urql's cache.
            { requestPolicy: "network-only" },
          )
          .toPromise();

        if (result.error || !result.data?.customers) {
          throw new Error(result.error?.message ?? "Customers query returned no data");
        }

        for (const { node } of result.data.customers.edges) {
          // Staff accounts are never counted or deleted.
          if (!node.isStaff) {
            customers.push(node);
          }
        }

        const { pageInfo } = result.data.customers;

        customersAfter = pageInfo.hasNextPage ? pageInfo.endCursor ?? null : null;
      } while (customersAfter);

      const checkouts: ScannedCheckout[] = [];

      // `checkoutDelete` only exists on Saleor 3.23+, so skip the scan otherwise.
      if (checkoutDeletionSupported) {
        let checkoutsAfter: string | null = null;

        do {
          const result: OperationResult<CheckoutsForDeletionQuery> = await client
            .query(
              CheckoutsForDeletionDocument,
              { after: checkoutsAfter },
              // Always hit the network: a re-scan must reflect the latest store state, not urql's cache.
              { requestPolicy: "network-only" },
            )
            .toPromise();

          if (result.error || !result.data?.checkouts) {
            throw new Error(result.error?.message ?? "Checkouts query returned no data");
          }

          for (const { node } of result.data.checkouts.edges) {
            checkouts.push(node);
          }

          const { pageInfo } = result.data.checkouts;

          checkoutsAfter = pageInfo.hasNextPage ? pageInfo.endCursor ?? null : null;
        } while (checkoutsAfter);
      }

      setScanResult({ orders, customers, checkouts });
    } catch (caughtError) {
      logger.error("Bulk scan failed", { error: caughtError });
      setScanError("Scan failed. Check the app permissions and try again.");
      setScanResult(null);
    } finally {
      setScanning(false);
    }
  };

  const anonymizeOrders = async () => {
    const orders = scanResult?.orders ?? [];

    setOrdersRun({ ...idleRun, running: true, total: orders.length });

    const failures: Failure[] = [];

    for (const batch of chunkArray(orders, env.NEXT_PUBLIC_BULK_CONCURRENCY)) {
      await Promise.all(
        batch.map(async (order) => {
          const scrambledUser = scrambleUserDetails(env.NEXT_PUBLIC_CUSTOMER_SCRAMBLE_DOMAIN);

          const updateResult = await client
            .mutation(OrderUpdateDocument, {
              id: order.id,
              input: {
                userEmail: scrambledUser.email,
                billingAddress: scrambleAddress(order.billingAddress),
                shippingAddress: scrambleAddress(order.shippingAddress),
              },
            })
            .toPromise();

          if (updateResult.error || updateResult.data?.orderUpdate?.errors?.length) {
            logger.error("Failed to anonymize order", {
              orderNumber: order.number,
              error: updateResult.error,
              mutationErrors: updateResult.data?.orderUpdate?.errors,
            });
            failures.push({
              id: order.id,
              label: `Order #${order.number}`,
              dashboardPath: `/orders/${order.id}`,
            });

            /*
             * The flag is only written after a successful scramble, so this
             * order stays "non-anonymized" and is retried on the next run.
             */
            return;
          }

          const metadataResult = await client
            .mutation(UpdateMetadataDocument, {
              id: order.id,
              input: [{ key: ANONYMIZED_METADATA_KEY, value: ANONYMIZED_METADATA_VALUE }],
            })
            .toPromise();

          if (metadataResult.error || metadataResult.data?.updateMetadata?.errors?.length) {
            logger.error("Failed to flag order as anonymized", {
              orderNumber: order.number,
              error: metadataResult.error,
              mutationErrors: metadataResult.data?.updateMetadata?.errors,
            });
            failures.push({
              id: order.id,
              label: `Order #${order.number}`,
              dashboardPath: `/orders/${order.id}`,
            });
          }
        }),
      );

      setOrdersRun((previous) => ({ ...previous, done: previous.done + batch.length }));
    }

    setOrdersRun({
      running: false,
      done: orders.length,
      total: orders.length,
      failures,
      finishedSummary: failures.length
        ? `Anonymized ${orders.length - failures.length} of ${orders.length} orders. Failed:`
        : `Anonymized ${orders.length} orders.`,
    });

    // Refresh counts (and the in-memory lists) so failures can be retried.
    await scan();
  };

  const deleteCustomers = async () => {
    const customers = scanResult?.customers ?? [];

    setCustomersRun({ ...idleRun, running: true, total: customers.length });

    const failures: Failure[] = [];

    for (const batch of chunkArray(customers, env.NEXT_PUBLIC_BULK_CONCURRENCY)) {
      await Promise.all(
        batch.map(async (customer) => {
          const result = await client
            .mutation(CustomerDeleteDocument, { id: customer.id })
            .toPromise();

          if (result.error || result.data?.customerDelete?.errors?.length) {
            logger.error("Failed to delete customer", {
              error: result.error,
              mutationErrors: result.data?.customerDelete?.errors,
            });
            failures.push({
              id: customer.id,
              label: customer.email,
              dashboardPath: `/customers/${customer.id}`,
            });
          }
        }),
      );

      setCustomersRun((previous) => ({ ...previous, done: previous.done + batch.length }));
    }

    setCustomersRun({
      running: false,
      done: customers.length,
      total: customers.length,
      failures,
      finishedSummary: failures.length
        ? `Deleted ${customers.length - failures.length} of ${customers.length} customers. Failed:`
        : `Deleted ${customers.length} customers.`,
    });

    await scan();
  };

  const deleteCheckouts = async () => {
    const checkouts = scanResult?.checkouts ?? [];

    setCheckoutsRun({ ...idleRun, running: true, total: checkouts.length });

    const failures: Failure[] = [];

    for (const batch of chunkArray(checkouts, env.NEXT_PUBLIC_BULK_CONCURRENCY)) {
      await Promise.all(
        batch.map(async (checkout) => {
          const result = await client
            .mutation(CheckoutDeleteDocument, { id: checkout.id })
            .toPromise();

          /*
           * Checkouts with attached payment transactions cannot be deleted and
           * surface here as an error - reported as a failure, not aborting the run.
           */
          if (result.error || result.data?.checkoutDelete?.errors?.length) {
            logger.error("Failed to delete checkout", {
              checkoutId: checkout.id,
              error: result.error,
              mutationErrors: result.data?.checkoutDelete?.errors,
            });
            // Checkouts have no Dashboard detail page, so render as plain text.
            failures.push({ id: checkout.id, label: `Checkout ${checkout.id}` });
          }
        }),
      );

      setCheckoutsRun((previous) => ({ ...previous, done: previous.done + batch.length }));
    }

    setCheckoutsRun({
      running: false,
      done: checkouts.length,
      total: checkouts.length,
      failures,
      finishedSummary: failures.length
        ? `Deleted ${checkouts.length - failures.length} of ${checkouts.length} checkouts. Failed:`
        : `Deleted ${checkouts.length} checkouts.`,
    });

    await scan();
  };

  return (
    <Box display="flex" flexDirection="column" gap={6}>
      <Box display="flex" flexDirection="column" gap={2} alignItems="start">
        <Text>
          Scan the store first to count the orders, customers and checkouts that will be processed.
          The results are kept in memory, so the actions below run without fetching them again.
        </Text>
        <Button onClick={scan} disabled={busy}>
          {scanning ? "Scanning..." : scanResult ? "Re-scan" : "Scan"}
        </Button>
        {scanError && <Text color="critical1">{scanError}</Text>}
      </Box>

      {scanResult && (
        <>
          <Box display="flex" flexDirection="column" gap={2} alignItems="start">
            <Text>
              <Text fontWeight="bold">{scanResult.orders.length}</Text>
              {" non-anonymized orders found."}
            </Text>
            <Button
              onClick={() => setPendingAction("orders")}
              disabled={busy || scanResult.orders.length === 0}
            >
              Anonymize orders
            </Button>
            <RunProgress run={ordersRun} label="Anonymizing orders" />
            <RunResult run={ordersRun} />
          </Box>

          <Box display="flex" flexDirection="column" gap={2} alignItems="start">
            <Text>
              <Text fontWeight="bold">{scanResult.customers.length}</Text>
              {" customers found. Staff accounts are not counted and will never be deleted."}
            </Text>
            <Button
              onClick={() => setPendingAction("customers")}
              disabled={busy || scanResult.customers.length === 0}
            >
              Delete customers
            </Button>
            <RunProgress run={customersRun} label="Deleting customers" />
            <RunResult run={customersRun} />
          </Box>

          <Box display="flex" flexDirection="column" gap={2} alignItems="start">
            {checkoutDeletionSupported ? (
              <>
                <Text>
                  <Text fontWeight="bold">{scanResult.checkouts.length}</Text>
                  {" checkouts found."}
                </Text>
                <Button
                  onClick={() => setPendingAction("checkouts")}
                  disabled={busy || scanResult.checkouts.length === 0}
                >
                  Delete checkouts
                </Button>
                <RunProgress run={checkoutsRun} label="Deleting checkouts" />
                <RunResult run={checkoutsRun} />
              </>
            ) : (
              <>
                <Text>Delete checkouts</Text>
                <Text size={2}>Requires Saleor 3.23+. This store does not support it.</Text>
                <Button disabled>Delete checkouts</Button>
              </>
            )}
          </Box>
        </>
      )}

      <ConfirmationModal
        open={pendingAction === "orders"}
        title="Anonymize all scanned orders?"
        description={`This will irreversibly scramble personal data on ${
          scanResult?.orders.length ?? 0
        } order(s). This cannot be undone.`}
        confirmLabel="Anonymize orders"
        onCancel={() => setPendingAction(null)}
        onConfirm={() => {
          setPendingAction(null);
          anonymizeOrders();
        }}
      />

      <ConfirmationModal
        open={pendingAction === "customers"}
        title="Delete all scanned customers?"
        description={`This will permanently delete ${
          scanResult?.customers.length ?? 0
        } customer account(s). This cannot be undone.`}
        confirmLabel="Delete customers"
        onCancel={() => setPendingAction(null)}
        onConfirm={() => {
          setPendingAction(null);
          deleteCustomers();
        }}
      />

      <ConfirmationModal
        open={pendingAction === "checkouts"}
        title="Delete all scanned checkouts?"
        description={`This will permanently delete ${
          scanResult?.checkouts.length ?? 0
        } checkout(s). Checkouts with attached payment transactions cannot be deleted and will be reported as failures. This cannot be undone.`}
        confirmLabel="Delete checkouts"
        onCancel={() => setPendingAction(null)}
        onConfirm={() => {
          setPendingAction(null);
          deleteCheckouts();
        }}
      />
    </Box>
  );
};
