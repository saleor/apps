import { Box, Button, Input, Text } from "@saleor/macaw-ui";
import { useEffect, useState } from "react";
import { useMutation, useQuery } from "urql";

import { env } from "@/env";
import {
  type CountryCode,
  CustomerDeleteDocument,
  OrderUpdateDocument,
  UserByEmailDocument,
} from "@/generated/graphql";
import { createLogger } from "@/logger";

import { scrambleDetails, scrambleUserDetails } from "./scramble";

const logger = createLogger("ScrambleAllOrdersByEmail");

/**
 * Builds an anonymized `AddressInput` from an order address, keeping the
 * non-identifying fields (city, postal code, street, country) intact.
 */
const scrambleAddress = <
  TAddress extends {
    firstName: string;
    lastName: string;
    phone?: string | null;
    city: string;
    postalCode: string;
    streetAddress1: string;
    countryArea: string;
    country: { code: string };
  },
>(
  address: TAddress | null | undefined,
) => {
  if (!address) {
    return null;
  }

  const { scrambledFirstName, scrambledLastName, scrambledPhone } = scrambleDetails({
    firstName: address.firstName,
    lastName: address.lastName,
    phone: address.phone,
  });

  return {
    firstName: scrambledFirstName,
    lastName: scrambledLastName,
    phone: scrambledPhone,
    city: address.city,
    postalCode: address.postalCode,
    streetAddress1: address.streetAddress1,
    country: address.country.code as CountryCode,
    countryArea: address.countryArea,
  };
};

export const ScrambleAllOrdersByEmail = () => {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [scrambling, setScrambling] = useState(false);

  const [{ data, fetching, error }, refetchOrders] = useQuery({
    query: UserByEmailDocument,
    variables: { email },
    pause: true,
  });

  /*
   * Surface GraphQL errors (e.g. missing MANAGE_ORDERS / MANAGE_USERS permission),
   * which Saleor returns alongside `data` rather than as a network error.
   */
  useEffect(() => {
    if (error) {
      logger.error("Failed to fetch user and orders", {
        graphQLErrors: error.graphQLErrors.map((graphQLError) => graphQLError.message),
        networkError: error.networkError?.message,
      });
    }
  }, [error]);

  const [{ fetching: updating }, updateOrder] = useMutation(OrderUpdateDocument);
  const [, deleteCustomer] = useMutation(CustomerDeleteDocument);

  const handleFetchOrders = () => {
    setMessage("");
    refetchOrders();
  };

  const handleScrambleAndUpdate = async () => {
    const user = data?.user;
    const userOrders = data?.orders?.edges ?? [];

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

  const orders = data?.orders?.edges;

  return (
    <Box display="flex" flexDirection="column" gap={4}>
      <Text as="h2" size={8}>
        Scramble All Orders by Email
      </Text>

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
        !fetching && !error && data && <Text>No orders found for this email.</Text>
      )}

      {message && <Text>{message}</Text>}
    </Box>
  );
};
