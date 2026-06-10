import { Box, Button, Input, Text } from "@saleor/macaw-ui";
import { useState } from "react";
import { type CombinedError, type OperationResult, useClient, useMutation } from "urql";

import { env } from "@/env";
import {
  CustomerDeleteDocument,
  OrderUpdateDocument,
  UserByEmailDocument,
  type UserByEmailQuery,
} from "@/generated/graphql";
import { createLogger } from "@/logger";

import { scrambleAddress, scrambleUserDetails } from "./scramble";

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

  const client = useClient();

  const [{ fetching: updating }, updateOrder] = useMutation(OrderUpdateDocument);
  const [, deleteCustomer] = useMutation(CustomerDeleteDocument);

  const handleFetchOrders = async () => {
    setMessage("");
    setError(null);
    setUser(null);
    setOrders(null);
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
          .query(UserByEmailDocument, { email, after })
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

      setUser(fetchedUser);
      setOrders(allOrders);
    } catch (e) {
      const combinedError = e as CombinedError;

      /*
       * Surface GraphQL errors (e.g. missing MANAGE_ORDERS / MANAGE_USERS
       * permission), which Saleor returns alongside `data` rather than as a
       * network error.
       */
      logger.error("Failed to fetch user and orders", {
        graphQLErrors: combinedError.graphQLErrors?.map((graphQLError) => graphQLError.message),
        networkError: combinedError.networkError?.message,
      });
      setError(combinedError);
    } finally {
      setFetching(false);
    }
  };

  const handleScrambleAndUpdate = async () => {
    const userOrders = orders ?? [];

    if (!userOrders.length) {
      setMessage("This customer has no orders.");

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

    // Guest-checkout orders have no linked user, so there is nothing to delete.
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
    setMessage(
      errors.length
        ? errors.join("\n")
        : user
        ? "All orders were successfully anonymized and the user was deleted."
        : "All orders were successfully anonymized.",
    );
  };

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

      {orders?.length ? (
        <Box>
          <Text>{`Found ${orders.length} orders for email: ${email}`}</Text>
          <ul>
            {orders.map(({ node }) => (
              <li key={node.id}>
                <Text>{`Order #${node.number}`}</Text>
              </li>
            ))}
          </ul>
          <Button onClick={handleScrambleAndUpdate} disabled={scrambling || updating}>
            Scramble and Update All Orders
          </Button>
        </Box>
      ) : (
        !fetching && !error && orders !== null && <Text>No orders found for this email.</Text>
      )}

      {message && <Text>{message}</Text>}
    </Box>
  );
};
