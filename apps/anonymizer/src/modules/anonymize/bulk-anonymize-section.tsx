import { TextLink } from "@saleor/apps-ui";
import { Box, Button, Text } from "@saleor/macaw-ui";
import { useState } from "react";
import { type OperationResult, useClient } from "urql";

import { env } from "@/env";
import {
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
import { scrambleAddress, scrambleUserDetails } from "./scramble";

const logger = createLogger("BulkAnonymizeSection");

type ScannedOrder = NonNullable<OrdersForAnonymizationQuery["orders"]>["edges"][number]["node"];
type ScannedCustomer = NonNullable<CustomersForDeletionQuery["customers"]>["edges"][number]["node"];

type Failure = {
  id: string;
  label: string;
  dashboardPath: string;
};

type RunState = {
  running: boolean;
  done: number;
  total: number;
  failures: Failure[];
  /** Set after the run finished, so the summary stays visible. */
  finishedSummary: string | null;
};

const idleRun: RunState = {
  running: false,
  done: 0,
  total: 0,
  failures: [],
  finishedSummary: null,
};

const RunProgress = ({ run }: { run: RunState }) => {
  if (!run.running) {
    return null;
  }

  return (
    <Box display="flex" flexDirection="column" gap={1} width="100%">
      <progress value={run.done} max={run.total} style={{ width: "100%" }} />
      <Text size={2}>{`${run.done} / ${run.total}`}</Text>
    </Box>
  );
};

const RunResult = ({ run }: { run: RunState }) => {
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
              <TextLink href={failure.dashboardPath} newTab>
                {failure.label}
              </TextLink>
            </li>
          ))}
        </Box>
      )}
    </Box>
  );
};

/**
 * Scans the whole store and bulk-processes it from the browser:
 * - "Anonymize orders" scrambles every order that does not yet carry the
 *   `saleor-anonymized: true` public metadata flag, then writes the flag.
 * - "Delete customers" deletes every non-staff customer account.
 *
 * The scan keeps full payloads in memory, so running an action does not
 * re-fetch anything. Failures are collected (not aborting the run) and listed
 * as links opening the record in a new Dashboard tab.
 */
export const BulkAnonymizeSection = () => {
  const client = useClient();

  const [scanning, setScanning] = useState(false);
  const [scanError, setScanError] = useState<string | null>(null);
  const [scanResult, setScanResult] = useState<{
    orders: ScannedOrder[];
    customers: ScannedCustomer[];
  } | null>(null);

  const [ordersRun, setOrdersRun] = useState<RunState>(idleRun);
  const [customersRun, setCustomersRun] = useState<RunState>(idleRun);

  const busy = scanning || ordersRun.running || customersRun.running;

  const scan = async () => {
    setScanning(true);
    setScanError(null);

    try {
      const orders: ScannedOrder[] = [];
      let ordersAfter: string | null = null;

      do {
        const result: OperationResult<OrdersForAnonymizationQuery> = await client
          .query(OrdersForAnonymizationDocument, { after: ordersAfter })
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
          .query(CustomersForDeletionDocument, { after: customersAfter })
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

      setScanResult({ orders, customers });
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
      ).then(() => {
        setOrdersRun((previous) => ({ ...previous, done: previous.done + batch.length }));
      });
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
      ).then(() => {
        setCustomersRun((previous) => ({ ...previous, done: previous.done + batch.length }));
      });
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

  return (
    <Box display="flex" flexDirection="column" gap={6}>
      <Box display="flex" flexDirection="column" gap={2} alignItems="start">
        <Text>
          Scan the store first to count the orders and customers that will be processed. The results
          are kept in memory, so the actions below run without fetching them again.
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
            <Button onClick={anonymizeOrders} disabled={busy || scanResult.orders.length === 0}>
              Anonymize orders
            </Button>
            <RunProgress run={ordersRun} />
            <RunResult run={ordersRun} />
          </Box>

          <Box display="flex" flexDirection="column" gap={2} alignItems="start">
            <Text>
              <Text fontWeight="bold">{scanResult.customers.length}</Text>
              {" customers found. Staff accounts are not counted and will never be deleted."}
            </Text>
            <Button onClick={deleteCustomers} disabled={busy || scanResult.customers.length === 0}>
              Delete customers
            </Button>
            <RunProgress run={customersRun} />
            <RunResult run={customersRun} />
          </Box>
        </>
      )}
    </Box>
  );
};
