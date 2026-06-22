import { Box, Button, Input, Text } from "@saleor/macaw-ui";
import { useState } from "react";
import { CombinedError, type OperationResult, useClient, useMutation } from "urql";

import { env } from "@/env";
import {
  CheckoutDeleteDocument,
  CheckoutsForDeletionDocument,
  type CheckoutsForDeletionQuery,
  CustomerDeleteDocument,
  OrderUpdateDocument,
  UserByEmailDocument,
  type UserByEmailQuery,
} from "@/generated/graphql";
import { createLogger } from "@/logger";

import { checkoutMatchesEmail } from "./checkouts";
import { ConfirmationModal } from "./confirmation-modal";
import { scrambleAddress, scrambleUserDetails } from "./scramble";
import { useCheckoutDeletionSupport } from "./use-checkout-deletion-support";

const logger = createLogger("ScrambleAllOrdersByEmail");

type FetchedUser = NonNullable<UserByEmailQuery["user"]>;
type OrderEdge = NonNullable<UserByEmailQuery["orders"]>["edges"][number];

export const ScrambleAllOrdersByEmail = () => {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [scrambling, setScrambling] = useState(false);
  const [fetching, setFetching] = useState(false);
  const [error, setError] = useState<CombinedError | null>(null);
  const [user, setUser] = useState<FetchedUser | null>(null);
  const [orders, setOrders] = useState<OrderEdge[] | null>(null);
  // Ids of this customer's checkouts (guest + registered), deleted on confirm.
  const [checkoutIds, setCheckoutIds] = useState<string[]>([]);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const client = useClient();
  const { supported: checkoutDeletionSupported } = useCheckoutDeletionSupport();

  const [{ fetching: updating }, updateOrder] = useMutation(OrderUpdateDocument);
  const [, deleteCustomer] = useMutation(CustomerDeleteDocument);
  const [, deleteCheckout] = useMutation(CheckoutDeleteDocument);

  const handleFetchOrders = async () => {
    setMessage("");
    setError(null);
    setUser(null);
    setOrders(null);
    setCheckoutIds([]);
    setFetching(true);

    try {
      const allOrders: OrderEdge[] = [];
      let fetchedUser: FetchedUser | null = null;
      let after: string | null = null;

      /*
       * Saleor returns at most one page (100) per request, so we walk every page
       * to make sure customers with more than 100 orders are fully anonymized.
       */
      do {
        const result: OperationResult<UserByEmailQuery> = await client
          .query(
            UserByEmailDocument,
            { email, after },
            // Always hit the network: re-fetching must reflect the latest store state, not urql's cache.
            { requestPolicy: "network-only" },
          )
          .toPromise();

        if (result.error) {
          throw result.error;
        }

        fetchedUser = result.data?.user ?? fetchedUser;

        const connection = result.data?.orders;

        if (!connection) {
          break;
        }

        allOrders.push(...connection.edges);

        after = connection.pageInfo.hasNextPage ? connection.pageInfo.endCursor ?? null : null;
      } while (after);

      const matchedCheckoutIds: string[] = [];

      /*
       * Saleor has no exact server-side filter on a checkout's own email, so we
       * walk every checkout and match on the `email` field client-side. This
       * also catches guest checkouts, which are not linked to the user and so
       * are never removed by `customerDelete`. Only attempted on Saleor >= 3.23,
       * which is where `checkoutDelete` exists.
       */
      if (checkoutDeletionSupported) {
        let checkoutsAfter: string | null = null;

        do {
          const result: OperationResult<CheckoutsForDeletionQuery> = await client
            .query(
              CheckoutsForDeletionDocument,
              { after: checkoutsAfter },
              { requestPolicy: "network-only" },
            )
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
              matchedCheckoutIds.push(node.id);
            }
          }

          checkoutsAfter = connection.pageInfo.hasNextPage
            ? connection.pageInfo.endCursor ?? null
            : null;
        } while (checkoutsAfter);
      }

      setUser(fetchedUser);
      setOrders(allOrders);
      setCheckoutIds(matchedCheckoutIds);
    } catch (e) {
      /*
       * Surface GraphQL errors (e.g. missing MANAGE_ORDERS / MANAGE_USERS
       * permission), which Saleor returns alongside `data` rather than as a
       * network error. Only urql's `CombinedError` exposes `graphQLErrors`, so
       * guard the type - anything else falls back to a generic message instead
       * of crashing the render path that reads `error.graphQLErrors`.
       */
      if (e instanceof CombinedError) {
        logger.error("Failed to fetch user and orders", {
          graphQLErrors: e.graphQLErrors?.map((graphQLError) => graphQLError.message),
          networkError: e.networkError?.message,
        });
        setError(e);
      } else {
        logger.error("Unexpected error while fetching user and orders", { error: e });
        setMessage("Something went wrong while fetching the user and orders. Please try again.");
      }
    } finally {
      setFetching(false);
    }
  };

  const handleScrambleAndUpdate = async () => {
    const userOrders = orders ?? [];

    /*
     * A registered customer can be erased even with no orders, and a guest can
     * have only abandoned checkouts, so only bail out when there is genuinely
     * nothing to anonymize (no orders, no account and no checkouts).
     */
    if (!userOrders.length && !user && !checkoutIds.length) {
      setMessage("Nothing to anonymize for this email.");

      return;
    }

    setScrambling(true);

    const errors: string[] = [];
    const scrambledUser = scrambleUserDetails(env.NEXT_PUBLIC_CUSTOMER_SCRAMBLE_DOMAIN);

    for (const { node: order } of userOrders) {
      if (!order) {
        continue;
      }

      const result = await updateOrder({
        id: order.id,
        input: {
          userEmail: scrambledUser.email,
          billingAddress: scrambleAddress(order.billingAddress),
          shippingAddress: scrambleAddress(order.shippingAddress),
        },
      });

      if (result.error || result.data?.orderUpdate?.errors?.length) {
        logger.error("Failed to update order", {
          orderNumber: order.number,
          error: result.error,
          mutationErrors: result.data?.orderUpdate?.errors,
        });
        errors.push(`Failed to update order #${order.number}`);
      }
    }

    /*
     * Delete the customer's checkouts (guest + registered) before the account.
     * Deleting the account would cascade-delete only the registered ones, so
     * guest checkouts must be removed explicitly here.
     */
    let deletedCheckoutCount = 0;

    for (const checkoutId of checkoutIds) {
      const result = await deleteCheckout({ id: checkoutId });

      if (result.error || result.data?.checkoutDelete?.errors?.length) {
        logger.error("Failed to delete checkout", {
          checkoutId,
          error: result.error,
          mutationErrors: result.data?.checkoutDelete?.errors,
        });
        errors.push(`Failed to delete a checkout (${checkoutId}).`);
      } else {
        deletedCheckoutCount += 1;
      }
    }

    /*
     * Only delete the account once every order and checkout was processed, so a
     * partial failure leaves the customer in place to retry.
     */
    if (!errors.length && user) {
      const result = await deleteCustomer({ id: user.id });

      if (result.error || result.data?.customerDelete?.errors?.length) {
        logger.error("Failed to delete the user", {
          error: result.error,
          mutationErrors: result.data?.customerDelete?.errors,
        });
        errors.push("Failed to delete the user.");
      }
    }

    setScrambling(false);

    const doneParts: string[] = [];

    if (userOrders.length) {
      doneParts.push(`anonymized ${userOrders.length} order(s)`);
    }

    if (deletedCheckoutCount) {
      doneParts.push(`deleted ${deletedCheckoutCount} checkout(s)`);
    }

    if (user && !errors.length) {
      doneParts.push("deleted the customer account");
    }

    const successMessage = doneParts.length
      ? `Successfully ${doneParts.join(", ")}.`
      : "Nothing to anonymize for this email.";

    setMessage(errors.length ? errors.join("\n") : successMessage);
  };

  const foundOrders = orders?.length ?? 0;
  const hasAnythingToAnonymize =
    orders !== null && (foundOrders > 0 || user || checkoutIds.length > 0);

  // Human-readable list of the irreversible actions, used in the confirmation.
  const plannedActions = [
    foundOrders ? `scramble personal data on ${foundOrders} order(s)` : null,
    checkoutIds.length ? `permanently delete ${checkoutIds.length} checkout(s)` : null,
    user ? "permanently delete the customer account" : null,
  ].filter((action): action is string => action !== null);

  return (
    <Box display="flex" flexDirection="column" gap={4}>
      <Input
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Enter customer email"
        disabled={fetching || scrambling}
      />
      <Button onClick={handleFetchOrders} disabled={!email || fetching || scrambling}>
        Fetch User and Orders
      </Button>

      {fetching && <Text>Loading user and orders...</Text>}
      {error && (
        <Box>
          <Text color="critical1">Failed to fetch user and orders.</Text>
          {error.graphQLErrors.map((graphQLError, index) => (
            <Text key={index} color="critical1" as="p">
              {graphQLError.message}
            </Text>
          ))}
          {error.networkError && (
            <Text color="critical1" as="p">
              {error.networkError.message}
            </Text>
          )}
        </Box>
      )}

      {hasAnythingToAnonymize ? (
        <Box>
          <Text as="p">
            {foundOrders
              ? `Found ${foundOrders} order(s) for email: ${email}`
              : "This customer has no orders."}
          </Text>
          {checkoutDeletionSupported ? (
            checkoutIds.length > 0 && (
              <Text as="p">{`Found ${checkoutIds.length} checkout(s) - these will be permanently deleted.`}</Text>
            )
          ) : (
            <Text as="p" size={2}>
              Checkout deletion requires Saleor 3.23+ and is skipped on this store.
            </Text>
          )}
          {user && <Text as="p">The customer account will be permanently deleted.</Text>}
          {foundOrders > 0 && (
            <ul>
              {(orders ?? []).map(({ node }) => (
                <li key={node.id}>
                  <Text>{`Order #${node.number}`}</Text>
                </li>
              ))}
            </ul>
          )}
          <Button onClick={() => setConfirmOpen(true)} disabled={scrambling || updating}>
            Anonymize customer data
          </Button>
        </Box>
      ) : (
        !fetching &&
        !error &&
        orders !== null && (
          <Text>No orders, checkouts or customer account found for this email.</Text>
        )
      )}

      {message && (
        <Box>
          {message.split("\n").map((line, index) => (
            <Text key={index} as="p">
              {line}
            </Text>
          ))}
        </Box>
      )}

      <ConfirmationModal
        open={confirmOpen}
        title="Anonymize this customer?"
        description={`This will ${plannedActions.join(", ")}. This cannot be undone.`}
        confirmLabel="Anonymize"
        onCancel={() => setConfirmOpen(false)}
        onConfirm={() => {
          setConfirmOpen(false);
          handleScrambleAndUpdate();
        }}
      />
    </Box>
  );
};
