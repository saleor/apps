import { actions, useAppBridge } from "@saleor/app-sdk/app-bridge";
import { Box, Text } from "@saleor/macaw-ui";
import Link from "next/link";
import { useQuery } from "urql";

import { LastOrderDocument, type ShippingMethod } from "@/generated/graphql";

const getShippingMethodName = (method: unknown) =>
  (method as ShippingMethod | undefined)?.__typename === "ShippingMethod"
    ? (method as ShippingMethod).name
    : undefined;

/**
 * Reads the last order back from Saleor, so the shipping method served by this app's
 * webhooks can be verified after a checkout is completed.
 */
const ActionsPage = () => {
  const { appBridge } = useAppBridge();
  const [{ data, fetching }] = useQuery({ query: LastOrderDocument });

  const lastOrder = data?.orders?.edges[0]?.node;

  const navigateToOrder = (id: string) => {
    appBridge?.dispatch(
      actions.Redirect({
        to: `/orders/${id}`,
      }),
    );
  };

  return (
    <Box padding={8} display="grid" gap={4} __maxWidth="640px">
      <Text as="h1" size={6}>
        Last order
      </Text>

      {fetching && <Text color="default2">Fetching the last order...</Text>}
      {!fetching && !lastOrder && <Text color="default2">No orders found</Text>}

      {lastOrder && (
        <Box
          backgroundColor="default2"
          padding={4}
          borderRadius={4}
          borderWidth={1}
          borderStyle="solid"
          borderColor="default1"
          display="grid"
          gap={2}
        >
          <Text as="p">{`Order #${lastOrder.number}`}</Text>
          <Text as="p">{`Delivered by ${
            getShippingMethodName(lastOrder.deliveryMethod) ?? "-"
          }`}</Text>
          <Text as="p">{`Ships to ${lastOrder.shippingAddress?.streetAddress1} ${lastOrder.shippingAddress?.postalCode} ${lastOrder.shippingAddress?.country.country}`}</Text>
          <Link onClick={() => navigateToOrder(lastOrder.id)} href={`/orders/${lastOrder.id}`}>
            See the order details
          </Link>
        </Box>
      )}
    </Box>
  );
};

export default ActionsPage;
